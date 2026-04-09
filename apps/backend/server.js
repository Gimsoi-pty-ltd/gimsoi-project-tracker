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

dotenv.config();

validateEnv();
// CLIENT_URL is only required in production
if (process.env.NODE_ENV === "production" && !process.env.CLIENT_URL) {
  throw new Error("Missing required env var: CLIENT_URL (required in production for CORS)");
}

const app = express();
app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  })
);
// CSRF protection — Double Submit Cookie via "csrf-csrf" package.
// Automatically skips safe methods (GET, HEAD, OPTIONS).
// See middleware/csrf.middleware.js for configuration.
app.use(csrfProtection);

// Routes
app.get("/api/status", (req, res) => res.json({ status: "ok" }));
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

// Start
const PORT = process.env.PORT || 5001;

// Surface any unhandled async error that would otherwise silently kill the process
process.on('unhandledRejection', (reason) => {
  console.error('[process] Unhandled rejection — server shutting down:', reason);
  process.exit(1);
});

(async () => {
  // Probe the DB connection before accepting requests.
  // Gives a clear error immediately if DATABASE_URL is wrong or unreachable.
  const prisma = (await import('./lib/prisma.js')).default;
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('[db] Connected.');
  } catch (err) {
    console.error(
      `\n[db] Cannot connect to the database.\n` +
      `     Check DATABASE_URL in your .env file.\n` +
      `     Reason: ${err.message}\n`
    );
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Surface listen errors (e.g. port already in use) instead of silently exiting
  server.on('error', (err) => {
    console.error(`\n[server] Failed to start: ${err.message}\n`);
    process.exit(1);
  });
})();

export default app;
