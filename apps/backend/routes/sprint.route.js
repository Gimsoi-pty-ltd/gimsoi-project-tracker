import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import { readLimiter, writeLimiter } from "../middleware/rate-limiter.middleware.js";
import { createSprint, getSprints, updateSprintStatus, updateSprint } from "../controllers/sprint.controller.js";

const router = express.Router();

router.get("/", readLimiter, verifyToken, authorize("VIEW_SPRINTS"), getSprints);
router.post("/", writeLimiter, verifyToken, authorize("MANAGE_SPRINTS"), createSprint);
router.patch("/:id/status", writeLimiter, verifyToken, authorize("MANAGE_SPRINTS"), updateSprintStatus);
router.patch("/:id", writeLimiter, verifyToken, authorize("MANAGE_SPRINTS"), updateSprint);

export default router;
