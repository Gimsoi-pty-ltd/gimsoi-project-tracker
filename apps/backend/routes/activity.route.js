import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import { readLimiter, writeLimiter } from "../middleware/rate-limiter.middleware.js";
import { requireCSRF } from "../middleware/csrf.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createActivitySchema } from "../schemas/activity.schema.js";
import { getActivities, createActivity } from "../controllers/activity.controller.js";

const router = express.Router();

/**
 * GET /api/activity
 * Fetch activities for a user (defaults to current user).
 */
router.get("/", readLimiter, verifyToken, getActivities);

/**
 * POST /api/activity
 * Log a new activity.
 */
router.post("/", writeLimiter, verifyToken, requireCSRF, validate(createActivitySchema), createActivity);

export default router;
