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
  deleteProject,
  syncProjectAnalytics,
} from "../controllers/project.controller.js";
import * as projectMemberController from "../controllers/projectMember.controller.js";
import * as labelController from "../controllers/label.controller.js";
import * as taskController from "../controllers/task.controller.js";
import { requireCSRF } from "../middleware/csrf.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createProjectSchema, updateProjectSchema } from "../schemas/project.schema.js";
import { bulkUpdateTasksSchema, bulkDeleteTasksSchema } from "../schemas/task.schema.js";
import { addMemberSchema, updateMemberRoleSchema } from "../schemas/projectMember.schema.js";

const router = express.Router();

// Everyone logged in can view projects (Client is read-only)
router.get("/", readLimiter, verifyToken, authorize("VIEW_PROJECTS"), getProjects);

// Allowed: ADMIN, PM, INTERN, CLIENT
router.get("/:id/progress", readLimiter, verifyToken, authorize("VIEW_PROJECTS"), getProjectProgress);

// Allowed: ADMIN, PM, INTERN, CLIENT
router.get("/:id", readLimiter, verifyToken, authorize("VIEW_PROJECTS"), getProjectById);

// Only Admin/PM can create/update/delete/sync
router.post("/", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, validate(createProjectSchema), createProject);
router.patch("/:id", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, validate(updateProjectSchema), updateProject);
router.delete("/:id", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, deleteProject);
router.post("/:id/analytics", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, syncProjectAnalytics);

// Member Management
router.post("/:id/members", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, validate(addMemberSchema), projectMemberController.addMember);
router.get("/:id/members", readLimiter, verifyToken, authorize("VIEW_PROJECTS"), projectMemberController.getMembers);
router.patch("/:id/members/:userId", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, validate(updateMemberRoleSchema), projectMemberController.updateMemberRole);
router.delete("/:id/members/:userId", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, projectMemberController.removeMember);

// Label Management
router.get("/:projectId/labels", readLimiter, verifyToken, authorize("VIEW_PROJECTS"), labelController.getLabels);

// Bulk Task Management
router.patch("/:projectId/tasks/bulk", writeLimiter, verifyToken, authorize("UPDATE_ANY_TASK"), requireCSRF, validate(bulkUpdateTasksSchema), taskController.bulkUpdateTasks);
router.delete("/:projectId/tasks/bulk", writeLimiter, verifyToken, authorize("DELETE_TASK"), requireCSRF, validate(bulkDeleteTasksSchema), taskController.bulkDeleteTasks);

export default router;
