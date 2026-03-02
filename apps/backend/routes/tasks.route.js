import express from "express";
import {
  createTask, getAllTasks, getTaskById,
  updateTask, deleteTask
} from '../controllers/task.controller.js';
import { verifyToken } from "../middleware/verifyToken.js";
import authorize from "../middleware/authMiddleware.js";
import { readLimiter, writeLimiter } from "../middleware/rateLimiter.js";
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
