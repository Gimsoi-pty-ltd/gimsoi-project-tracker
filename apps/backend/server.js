import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import taskRoute from "./routes/task.route.js";
import { csrfProtection, csrfErrorHandler } from "./middleware/csrf.middleware.js";
import clientRoutes from "./routes/client.route.js";
import projectRoutes from "./routes/project.route.js";
import sprintRoutes from "./routes/sprint.route.js";
import { validateEnv } from "./utils/validateEnv.js";
import registerTestingRoutes from "./utils/registerTestingRoutes.js";
import healthRoute from "./routes/health.route.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./lib/swagger.js";

dotenv.config();

// Validate required environment variables
validateEnv();

if (process.env.NODE_ENV === "production" && !process.env.CLIENT_URL) {
  throw new Error("Missing required env var: CLIENT_URL (required in production for CORS)");
}

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || process.env.X_ZOHO_CATALYST_LISTEN_PORT || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  })
);

import { healthLimiter } from "./middleware/rate-limiter.middleware.js";

// Health endpoint — registered before CSRF so probes require no session token
app.use("/api/health", healthLimiter, healthRoute);


// Swagger UI — development only, never exposed in production
const isNonProd = process.env.NODE_ENV !== "production" || process.env.PRODUCTION === "false";
if (isNonProd) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api/docs.json", (req, res) => res.json(swaggerSpec));
  console.log("[swagger] UI available at /api/docs");
}

// CSRF protection — Double Submit Cookie via "csrf-csrf" package.
app.use(csrfProtection);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoute);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sprints", sprintRoutes);

// CSRF error handler — must be after routes
app.use(csrfErrorHandler);

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (statusCode === 500) {
    console.error("[Global Error Handler]", err);
  }
  return res.status(statusCode).json({ success: false, message: err.message || "Internal Server Error" });
});

// Test-only routes
await registerTestingRoutes(app);

// Initialize DB and Start Server
const PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || 5000;

process.on("unhandledRejection", (reason) => {
  console.error("[fatal] Unhandled rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[fatal] Uncaught exception:", err);
  process.exit(1);
});

let server;
const gracefulShutdown = async (signal) => {
  console.log(`[server] ${signal} received. Shutting down...`);
  server?.close(async () => {
    const { default: prisma } = await import("./lib/prisma.js");
    await prisma.$disconnect();
    console.log("[server] Clean exit.");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

(async () => {
  try {
    const prisma = (await import('./lib/prisma.js')).default;
    await prisma.$queryRaw`SELECT 1`;
    console.log('[db] Connected.');

    server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`[server] Running on port ${PORT}`);
    });
  } catch (err) {
    console.error(`\n[fatal] Initialization failed: ${err.message}\n`);
    process.exit(1);
  }
})();

export default app;
