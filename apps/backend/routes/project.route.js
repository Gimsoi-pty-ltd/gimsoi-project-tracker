import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import authorize, {
  authorizeEmployeeRecommendations
} from "../middleware/auth.middleware.js";
import { readLimiter, writeLimiter } from "../middleware/rate-limiter.middleware.js";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  getProjectProgress,
  getProjectHealth,
  deleteProject,
  syncProjectAnalytics,
} from "../controllers/project.controller.js";
import * as projectMemberController from "../controllers/projectMember.controller.js";
import * as employeeRecommendationController from "../controllers/employeeRecommendation.controller.js";
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

/**
 * @swagger
 * /api/projects/{id}/health:
 *   get:
 *     summary: Get project health status and completion rate
 *     description: |
 *       Retrieves the high-level health status (RED, AMBER, GREEN) and completion percentage for a project.
 *       
 *       **Authorization & Permissions:**
 *       - Requires authentication.
 *       - Requires `VIEW_PROJECTS` permission (Allowed: `ADMIN`, `PM`, `INTERN`, `CLIENT`).
 *       
 *       **Health Calculation & Thresholds:**
 *       - Completion Rate is calculated as `percentComplete = Math.round((DONE / totalTasks) * 100)`.
 *       - Health status categorization:
 *         - `GREEN`: completionRate >= 80%
 *         - `AMBER`: completionRate >= 50% and < 80%
 *         - `RED`: completionRate < 50%
 *     tags:
 *       - Analytics & Health
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *         example: "a81d428e-5b1b-4f90-8e6d-53c89b2d9213"
 *     responses:
 *       200:
 *         description: Project health status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectId:
 *                       type: string
 *                       example: "a81d428e-5b1b-4f90-8e6d-53c89b2d9213"
 *                     projectName:
 *                       type: string
 *                       example: "Website Redesign"
 *                     completionRate:
 *                       type: integer
 *                       example: 75
 *                     healthStatus:
 *                       type: string
 *                       enum: [RED, AMBER, GREEN]
 *                       example: "AMBER"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized - no token provided"
 *       403:
 *         description: Forbidden - missing permission
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied. Role 'ANONYMOUS' does not have 'VIEW_PROJECTS' permission."
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Project not found"
 */
router.get(
  "/:id/health",
  readLimiter,
  verifyToken,
  authorize("VIEW_PROJECTS"),
  getProjectHealth
);

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

router.get(
  "/:id/employee-recommendations",
  readLimiter,
  verifyToken,
  authorizeEmployeeRecommendations,
  employeeRecommendationController.getEmployeeRecommendations
);

router.patch("/:id/members/:userId", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, validate(updateMemberRoleSchema), projectMemberController.updateMemberRole);
router.delete("/:id/members/:userId", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, projectMemberController.removeMember);

// Label Management
router.get("/:projectId/labels", readLimiter, verifyToken, authorize("VIEW_PROJECTS"), labelController.getLabels);

// Bulk Task Management
router.patch("/:projectId/tasks/bulk", writeLimiter, verifyToken, authorize("UPDATE_ANY_TASK"), requireCSRF, validate(bulkUpdateTasksSchema), taskController.bulkUpdateTasks);
router.delete("/:projectId/tasks/bulk", writeLimiter, verifyToken, authorize("DELETE_TASK"), requireCSRF, validate(bulkDeleteTasksSchema), taskController.bulkDeleteTasks);

export default router;
