import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import { requireAnyRole } from "../middleware/rbac.middleware.js";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
} from "../controllers/project.controller.js";

const router = express.Router();

// Everyone logged in can view projects (Client is read-only)
router.get("/", verifyToken, requireAnyRole(["ADMIN", "PM", "INTERN", "CLIENT"]), getProjects);
router.get("/:id", verifyToken, requireAnyRole(["ADMIN", "PM", "INTERN", "CLIENT"]), getProjectById);

// Only Admin/PM can create/update
router.post("/", verifyToken, requireAnyRole(["ADMIN", "PM"]), createProject);
router.patch("/:id", verifyToken, requireAnyRole(["ADMIN", "PM"]), updateProject);

export default router;
