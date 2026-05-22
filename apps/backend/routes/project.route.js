import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import authorize from "../middleware/auth.middleware.js";
import { readLimiter, writeLimiter } from "../middleware/rate-limiter.middleware.js";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  getProjectProgress,
  syncProjectAnalytics,
  deleteProject,
} from "../controllers/project.controller.js";
import { requireCSRF } from "../middleware/csrf.middleware.js";

const router = express.Router();

// Everyone logged in can view projects (Client is read-only)
router.get("/", readLimiter, verifyToken, authorize("VIEW_PROGRESS"), getProjects);
// Progress route must be declared before /:id to prevent Express matching 'progress' as an id param
// POLICY-PENDING: CLIENT sees full task breakdown — restrict to percentComplete only if team decides
router.get("/:id/progress", readLimiter, verifyToken, authorize("VIEW_PROGRESS"), getProjectProgress);
router.get("/:id", readLimiter, verifyToken, authorize("VIEW_PROGRESS"), getProjectById);

// Only Admin/PM can create/update
router.post("/", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, createProject);
router.patch("/:id", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, updateProject);
router.delete("/:id", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, deleteProject);
export default router;
