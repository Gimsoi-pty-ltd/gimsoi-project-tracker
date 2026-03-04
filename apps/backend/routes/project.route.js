import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import { requireAnyRole } from "../middleware/rbac.middleware.js";
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
router.get("/", readLimiter, verifyToken, requireAnyRole(["ADMIN", "PM", "INTERN", "CLIENT"]), getProjects);
// Progress route must be declared before /:id to prevent Express matching 'progress' as an id param
// POLICY-PENDING: CLIENT sees full task breakdown — restrict to percentComplete only if team decides
router.get("/:id/progress", readLimiter, verifyToken, requireAnyRole(["ADMIN", "PM", "INTERN", "CLIENT"]), getProjectProgress);
router.get("/:id", readLimiter, verifyToken, requireAnyRole(["ADMIN", "PM", "INTERN", "CLIENT"]), getProjectById);

// Only Admin/PM can create/update
router.post("/", writeLimiter, verifyToken, requireAnyRole(["ADMIN", "PM"]), createProject);
router.patch("/:id", writeLimiter, verifyToken, requireAnyRole(["ADMIN", "PM"]), updateProject);

export default router;
