import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import authorize from "../middleware/auth.middleware.js";
import { writeLimiter } from "../middleware/rate-limiter.middleware.js";
import { deleteComment } from "../controllers/comment.controller.js";
import { requireCSRF } from "../middleware/csrf.middleware.js";

const router = express.Router();

/**
 * DELETE /api/comments/:id — UPDATE_TASK
 * Allowed: Owner, ADMIN, PM
 */
router.delete("/:id", writeLimiter, verifyToken, authorize("UPDATE_TASK"), requireCSRF, deleteComment);

export default router;
