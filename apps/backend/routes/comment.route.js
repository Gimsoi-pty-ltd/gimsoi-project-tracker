import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import authorize from "../middleware/auth.middleware.js";
import { readLimiter, writeLimiter } from "../middleware/rate-limiter.middleware.js";
import { deleteComment, getComments, createComment } from "../controllers/comment.controller.js";
import { requireCSRF } from "../middleware/csrf.middleware.js";

const router = express.Router();

/**
 * GET /api/comments/task/:taskId — Alias for task comments
 */
router.get("/task/:taskId", readLimiter, verifyToken, authorize("VIEW_TASKS"), getComments);

/**
 * POST /api/comments/task/:taskId — Alias for creating task comments
 */
router.post("/task/:taskId", writeLimiter, verifyToken, authorize("UPDATE_TASK"), requireCSRF, createComment);

/**
 * DELETE /api/comments/:id — UPDATE_TASK
 * Allowed: Owner, ADMIN, PM
 */
router.delete("/:id", writeLimiter, verifyToken, authorize("UPDATE_TASK"), requireCSRF, deleteComment);

export default router;
