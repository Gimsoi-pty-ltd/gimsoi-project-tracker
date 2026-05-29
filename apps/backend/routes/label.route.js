import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import authorize from "../middleware/auth.middleware.js";
import { readLimiter, writeLimiter } from "../middleware/rate-limiter.middleware.js";
import { updateLabel, deleteLabel, createLabel } from "../controllers/label.controller.js";
import { requireCSRF } from "../middleware/csrf.middleware.js";

const router = express.Router();

/**
 * POST /api/labels
 * Creates a label. Expects projectId in body.
 */
router.post("/", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, createLabel);

/**
 * PATCH /api/labels/:id
 * Updates a label
 */
router.patch("/:id", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, updateLabel);

/**
 * DELETE /api/labels/:id
 * Deletes a label
 */
router.delete("/:id", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, deleteLabel);

export default router;
