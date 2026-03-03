import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireAnyRole } from "../middleware/rbac.middleware.js";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
} from "../controllers/project.controller.js";

const router = express.Router();

// Everyone logged in can view projects (Client is read-only)
router.get("/", verifyToken, requireAnyRole(["Admin", "PM", "Intern", "Client"]), getProjects);
router.get("/:id", verifyToken, requireAnyRole(["Admin", "PM", "Intern", "Client"]), getProjectById);

// Only Admin/PM can create/update
router.post("/", verifyToken, requireAnyRole(["Admin", "PM"]), createProject);
router.patch("/:id", verifyToken, requireAnyRole(["Admin", "PM"]), updateProject);

export default router;
