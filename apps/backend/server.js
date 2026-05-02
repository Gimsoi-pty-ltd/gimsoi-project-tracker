import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoutes from "./routes/auth.route.js";
import taskRoute from "./routes/task.route.js";
import methodOverride from "method-override";
import clientRoutes from "./routes/client.route.js";
import projectRoutes from "./routes/project.route.js";
import sprintRoutes from "./routes/sprint.route.js";
import { validateEnv } from "./utils/validateEnv.js";
import registerTestingRoutes from "./utils/registerTestingRoutes.js";
import healthRoute from "./routes/health.route.js";
import userRoutes from "./routes/user.route.js";
import phaseRoutes from "./routes/phase.route.js";
import reportRoutes from "./routes/report.route.js";
import searchRoutes from "./routes/search.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import { swaggerSpec } from "./lib/swagger.js";
import swaggerUi from "swagger-ui-express";
import { healthLimiter } from "./middleware/rate-limiter.middleware.js";
import { ZodError } from "zod";
import pkg from "./lib/generated/prisma/index.js";
const { Prisma } = pkg;

dotenv.config();

// Validate required environment variables
validateEnv();

if (process.env.NODE_ENV === "production" && !process.env.CLIENT_URL) {
  throw new Error("Missing required env var: CLIENT_URL (required in production for CORS)");
}

const app = express();
app.use(morgan("dev"));
app.disable("x-powered-by");
app.set("trust proxy", 1);

// CORS — origin callback for explicit multi-origin matching
const corsOptions = {
  origin: (origin, callback) => {
    const allowed = [
      process.env.CLIENT_URL,
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
app.use(express.urlencoded({ extended: true, limit: "100kb", parameterLimit: 1000 })); // Requires strict limits to prevent memory exhaustion DoS
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

// Health endpoint — registered before CSRF so probes require no session token
app.use("/api/health", healthLimiter, healthRoute);


// Swagger UI
const isNonProd = process.env.NODE_ENV !== "production" || process.env.PRODUCTION === "false";
if (isNonProd) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api/docs.json", (req, res) => res.json(swaggerSpec));
  console.log("[swagger] UI available at /api/docs");
}


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoute);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sprints", sprintRoutes);
app.use("/api/phases", phaseRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/analytics", analyticsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Semantic Mapping: Zod Validation Errors
  if (err instanceof ZodError || err.name === 'ZodError') {
    statusCode = 400;
    message = err.errors?.[0]?.message || err.message;
  } 
  // Semantic Mapping: Prisma Database Errors
  else if (err.name === 'PrismaClientKnownRequestError' || (err.constructor && err.constructor.name === 'PrismaClientKnownRequestError')) {
    if (err.code === "P2002") {
      statusCode = 409;
      message = "A resource with that value already exists.";
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "The requested resource was not found.";
    } else if (err.code === "P2003") {
      statusCode = 409;
      message = "Operation failed due to a missing related resource.";
    } else if (err.code === "P2009" || err.code === "P2019") {
      statusCode = 400;
      message = `Invalid data provided: ${err.message}`;
    }
  }

  if (statusCode === 500) {
    console.error("[Global Error Handler]", err);
    if (process.env.NODE_ENV === "production") {
      message = "An unexpected server error occurred. Please contact support.";
    }
  }

  return res.status(statusCode).json({ success: false, message });
});

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

    // Test-only routes — registered after DB confirms so test resets have a live connection
    await registerTestingRoutes(app);

    server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`[server] Running on port ${PORT}`);
    });
  } catch (err) {
    console.error(`\n[fatal] Initialization failed: ${err.message}\n`);
    process.exit(1);
  }
})();

export default app;
