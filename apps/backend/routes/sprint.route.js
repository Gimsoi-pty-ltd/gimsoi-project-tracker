import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import authorize from "../middleware/auth.middleware.js";
import { readLimiter, writeLimiter } from "../middleware/rate-limiter.middleware.js";
import { createSprint, getSprints, updateSprintStatus } from "../controllers/sprint.controller.js";

const router = express.Router();

router.get("/", readLimiter, verifyToken, authorize("VIEW_PROGRESS"), getSprints);
router.post("/", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), createSprint);
router.patch("/:id/status", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), updateSprintStatus);

export default router;
