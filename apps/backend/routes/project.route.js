import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import { readLimiter, writeLimiter } from "../middleware/rate-limiter.middleware.js";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  getProjectProgress,
  syncProjectAnalytics,
} from "../controllers/project.controller.js";
import { requireCSRF } from "../middleware/csrf.middleware.js";

const router = express.Router();

// Everyone logged in can view projects (Client is read-only)
router.get("/", readLimiter, verifyToken, authorize("VIEW_PROJECTS"), getProjects);

// Allowed: ADMIN, PM, INTERN, CLIENT
router.get("/:id/progress", readLimiter, verifyToken, authorize("VIEW_PROJECTS"), getProjectProgress);

// Allowed: ADMIN, PM, INTERN, CLIENT
router.get("/:id", readLimiter, verifyToken, authorize("VIEW_PROJECTS"), getProjectById);

// Only Admin/PM can create/update
router.post("/", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, createProject);
router.patch("/:id", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, updateProject);
router.post("/:id/analytics", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, syncProjectAnalytics);

export default router;
