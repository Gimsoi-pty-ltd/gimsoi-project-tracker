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
} from "../controllers/project.controller.js";

const router = express.Router();

// Everyone logged in can view projects (Client is read-only)
router.get("/", readLimiter, verifyToken, authorize("VIEW_PROJECTS"), getProjects);
// Progress route must be declared before /:id to prevent Express matching 'progress' as an id param
// POLICY-PENDING: CLIENT sees full task breakdown — restrict to percentComplete only if team decides
router.get("/:id/progress", readLimiter, verifyToken, authorize("VIEW_PROJECTS"), getProjectProgress);
router.get("/:id", readLimiter, verifyToken, authorize("VIEW_PROJECTS"), getProjectById);

// Only Admin/PM can create/update
router.post("/", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), createProject);
router.patch("/:id", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), updateProject);

export default router;
