import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import tasksRoutes from "./routes/tasks.route.js";
import { csrfProtection, csrfErrorHandler } from "./middleware/csrfProtection.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("Missing required env var: JWT_SECRET");
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
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-role", "x-csrf-token"],
  })
);
// CSRF protection — Double Submit Cookie via "csrf-csrf" package.
// Automatically skips safe methods (GET, HEAD, OPTIONS).
// See middleware/csrfProtection.js for configuration.
app.use(csrfProtection);

// Routes
app.get("/api/status", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/sprints", sprintRoutes);

// CSRF error handler — must be after routes
app.use(csrfErrorHandler);

// Start

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
