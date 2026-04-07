import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import authorize from "../middleware/auth.middleware.js";
import { readLimiter, writeLimiter } from "../middleware/rate-limiter.middleware.js";
import { createTask, getTasks, getTaskById, updateTask, deleteTask, getTaskSummary } from "../controllers/task.controller.js";

const router = express.Router();

/**
 * GET /api/tasks — VIEW_PROGRESS
 * Allowed: ADMIN, PM, INTERN, CLIENT
 */
router.get("/", readLimiter, verifyToken, authorize("VIEW_TASK"), getTasks);

/**
* GET /api/tasks/projects/:projectId/summary — VIEW_PROGRESS
* Allowed: ADMIN, PM, INTERN, CLIENT
*/
router.get("/projects/:projectId/summary", readLimiter, verifyToken, authorize("VIEW_PROGRESS"), getTaskSummary);

/**
 * GET /api/tasks/:id — VIEW_TASK
 * Allowed: ADMIN, PM, INTERN, CLIENT
 */
router.get("/:id", readLimiter, verifyToken, authorize("VIEW_PROGRESS"), getTaskById);

/**
 * POST /api/tasks — CREATE_TASK
 * Allowed: ADMIN, PM
 */
router.post("/", writeLimiter, verifyToken, authorize("CREATE_PROGRESS"), createTask);

/**
 * PATCH /api/tasks/:id — UPDATE_TASK
 * Allowed: ADMIN, INTERN
 */
router.patch("/:id", writeLimiter, verifyToken, authorize("UPDATE_TASK"), updateTask);

/**
 * DELETE /api/tasks/:id — DELETE_TASK
 * Allowed: ADMIN
 */
router.delete("/:id", writeLimiter, verifyToken, authorize("DELETE_TASK"), deleteTask);

export default router;
