import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import authorize from "../middleware/auth.middleware.js";
import { readLimiter, writeLimiter } from "../middleware/rate-limiter.middleware.js";
import { createSprint, getSprints, updateSprintStatus, updateSprint, getSprintVelocity, getSprintBurndown } from "../controllers/sprint.controller.js";
import { requireCSRF } from "../middleware/csrf.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createSprintSchema, updateSprintSchema, updateSprintStatusSchema } from "../schemas/sprint.schema.js";

const router = express.Router();

/**
 * GET /api/sprints/:id/velocity — VIEW_SPRINTS
 * Allowed: ADMIN, PM, INTERN, CLIENT
 */
router.get("/:id/velocity", readLimiter, verifyToken, authorize("VIEW_SPRINTS"), getSprintVelocity);

/**
 * GET /api/sprints/:id/burndown — VIEW_SPRINTS
 * Allowed: ADMIN, PM, INTERN, CLIENT
 */
router.get("/:id/burndown", readLimiter, verifyToken, authorize("VIEW_SPRINTS"), getSprintBurndown);

/**
 * GET /api/sprints — VIEW_SPRINTS
 * Allowed: ADMIN, PM, INTERN, CLIENT
 */
router.get("/", readLimiter, verifyToken, authorize("VIEW_SPRINTS"), getSprints);

/**
 * POST /api/sprints — MANAGE_SPRINTS
 * Allowed: ADMIN, PM
 */
router.post("/", writeLimiter, verifyToken, authorize("MANAGE_SPRINTS"), requireCSRF, validate(createSprintSchema), createSprint);

/**
 * PATCH /api/sprints/:id/status — MANAGE_SPRINTS
 * Allowed: ADMIN, PM
 */
router.patch("/:id/status", writeLimiter, verifyToken, authorize("MANAGE_SPRINTS"), requireCSRF, validate(updateSprintStatusSchema), updateSprintStatus);

/**
 * PATCH /api/sprints/:id — MANAGE_SPRINTS
 * Allowed: ADMIN, PM
 */
router.patch("/:id", writeLimiter, verifyToken, authorize("MANAGE_SPRINTS"), requireCSRF, validate(updateSprintSchema), updateSprint);

export default router;
