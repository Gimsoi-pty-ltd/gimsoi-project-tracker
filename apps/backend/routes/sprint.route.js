import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import { readLimiter, writeLimiter } from "../middleware/rate-limiter.middleware.js";
import { createSprint, getSprints, updateSprintStatus, updateSprint } from "../controllers/sprint.controller.js";
import { requireCSRF } from "../middleware/csrf.middleware.js";

const router = express.Router();

/**
 * GET /api/sprints — VIEW_SPRINTS
 * Allowed: ADMIN, PM, INTERN, CLIENT
 */
router.get("/", readLimiter, verifyToken, authorize("VIEW_SPRINTS"), getSprints);

/**
 * POST /api/sprints — MANAGE_SPRINTS
 * Allowed: ADMIN, PM
 */
router.post("/", writeLimiter, verifyToken, authorize("MANAGE_SPRINTS"), requireCSRF, createSprint);

/**
 * PATCH /api/sprints/:id/status — MANAGE_SPRINTS
 * Allowed: ADMIN, PM
 */
router.patch("/:id/status", writeLimiter, verifyToken, authorize("MANAGE_SPRINTS"), requireCSRF, updateSprintStatus);

/**
 * PATCH /api/sprints/:id — MANAGE_SPRINTS
 * Allowed: ADMIN, PM
 */
router.patch("/:id", writeLimiter, verifyToken, authorize("MANAGE_SPRINTS"), requireCSRF, updateSprint);

export default router;
