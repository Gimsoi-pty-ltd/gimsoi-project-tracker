import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import authRoutes from "./routes/auth.route.js";
import tasksRoutes from "./routes/task.route.js";
import clientRoutes from "./routes/client.route.js";
import projectRoutes from "./routes/project.route.js";
import sprintRoutes from "./routes/sprint.route.js";
import healthRoute from "./routes/health.route.js";
import { validateEnv } from "./utils/validateEnv.js";
import { csrfProtection, csrfErrorHandler } from "./middleware/csrf.middleware.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./lib/swagger.js";

dotenv.config();

validateEnv();
// CLIENT_URL is only required in production
if (process.env.NODE_ENV === "production" && !process.env.CLIENT_URL) {
  throw new Error("Missing required env var: CLIENT_URL (required in production for CORS)");
}

const app = express();
app.set("trust proxy", 1);

// CORS — origin callback for explicit multi-origin matching
const corsOptions = {
  origin: (origin, callback) => {
    const allowed = [
      process.env.CLIENT_URL,
      process.env.X_ZOHO_CATALYST_LISTEN_PORT,
      "http://localhost:5173",
      "http://localhost:5001",
    ].filter(Boolean);
    // Allow requests with no origin (e.g. curl, mobile, health probes)
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  optionsSuccessStatus: 204,
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "100kb", parameterLimit: 1000 })); 
app.use(cookieParser());
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// Explicit OPTIONS handler — required for AppSail proxy to pass preflight
app.options(/.*/, cors(corsOptions));
app.use(cors(corsOptions));


import { healthLimiter } from "./middleware/rate-limiter.middleware.js";

// Health endpoint — registered before CSRF so probes require no session token
app.use("/api/health", healthLimiter, healthRoute);

// CSRF protection
app.use(csrfProtection);

// Swagger UI
const isNonProd = process.env.NODE_ENV !== "production" || process.env.PRODUCTION === "false";
if (isNonProd) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api/docs.json", (req, res) => res.json(swaggerSpec));
  console.log("[swagger] UI available at /api/docs");
}

// Routes
app.get("/api/status", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sprints", sprintRoutes);

// CSRF error handler — must be after routes
app.use(csrfErrorHandler);

// Test-only routes
if (process.env.NODE_ENV === 'test') {
  const { default: testingRoutes } = await import('./routes/testing.route.js');
  app.use('/api/testing', testingRoutes);
}

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (statusCode === 500) {
    console.error("[Global Error Handler]", err);
  }
  return res.status(statusCode).json({ success: false, message: err.message || "Internal Server Error" });
});

// Start
const PORT = process.env.PORT || 5001;

// Graceful Shutdown
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
  const prisma = (await import('./lib/prisma.js')).default;
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('[db] Connected.');

    server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`[server] Running on port ${PORT}`);
    });

    server.on('error', (err) => {
      console.error(`\n[server] Failed to start: ${err.message}\n`);
      process.exit(1);
    });
  } catch (err) {
    console.error(
      `\n[db] Cannot connect to the database.\n` +
      `     Check DATABASE_URL in your .env file.\n` +
      `     Reason: ${err.message}\n`
    );
    process.exit(1);
  }
})();

export default app;

