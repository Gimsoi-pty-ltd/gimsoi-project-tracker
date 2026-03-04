import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import authorize from "../middleware/auth.middleware.js";
import { readLimiter, writeLimiter } from "../middleware/rate-limiter.middleware.js";
import { createTask, getTasks, updateTask, deleteTask } from "../controllers/task.controller.js";

const router = express.Router();

/**
 * GET /api/tasks — VIEW_PROGRESS
 * Allowed: ADMIN, PM, INTERN, CLIENT
 */
router.get("/", readLimiter, verifyToken, authorize("VIEW_PROGRESS"), getTasks);

/**
 * POST /api/tasks — CREATE_TASK
 * Allowed: ADMIN, PM
 */
router.post("/", writeLimiter, verifyToken, authorize("CREATE_TASK"), createTask);

/**
 * PUT /api/tasks/:id — UPDATE_TASK
 * Allowed: ADMIN, INTERN
 */
router.put("/:id", writeLimiter, verifyToken, authorize("UPDATE_TASK"), updateTask);

/**
 * DELETE /api/tasks/:id — DELETE_TASK
 * Allowed: ADMIN
 */
router.delete("/:id", writeLimiter, verifyToken, authorize("DELETE_TASK"), deleteTask);

export default router;
