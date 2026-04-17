import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import { readLimiter, writeLimiter } from "../middleware/rate-limiter.middleware.js";
import { createTask, getTasks, getTaskById, updateTask, deleteTask, getTaskSummary } from "../controllers/task.controller.js";
import { requireCSRF } from "../middleware/csrf.middleware.js";

const router = express.Router();

/**
 * GET /api/tasks — VIEW_TASKS
 * Allowed: ADMIN, PM, INTERN, CLIENT
 */
router.get("/", readLimiter, verifyToken, authorize("VIEW_TASKS"), getTasks);

/**
 * GET /api/tasks/projects/:projectId/summary — VIEW_TASKS
 * Allowed: ADMIN, PM, INTERN, CLIENT
 */
router.get("/projects/:projectId/summary", readLimiter, verifyToken, authorize("VIEW_TASKS"), getTaskSummary);

/**
 * GET /api/tasks/:id — VIEW_TASKS
 * Allowed: ADMIN, PM, INTERN, CLIENT
 */
router.get("/:id", readLimiter, verifyToken, authorize("VIEW_TASKS"), getTaskById);

/**
 * POST /api/tasks — CREATE_TASK
 * Allowed: ADMIN, PM
 */
router.post("/", writeLimiter, verifyToken, authorize("CREATE_TASK"), requireCSRF, createTask);

/**
 * PATCH /api/tasks/:id — UPDATE_TASK
 * Allowed: ADMIN, PM, INTERN
 */
router.patch("/:id", writeLimiter, verifyToken, authorize("UPDATE_TASK"), requireCSRF, updateTask);

/**
 * Allowed: ADMIN, PM, INTERN
 */
router.delete("/:id", writeLimiter, verifyToken, authorize(["DELETE_TASK", "DELETE_OWN_TASK"]), requireCSRF, deleteTask);

export default router;
