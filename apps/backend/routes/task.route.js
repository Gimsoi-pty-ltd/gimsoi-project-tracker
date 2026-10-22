import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import authorize from "../middleware/auth.middleware.js";
import { readLimiter, writeLimiter } from "../middleware/rate-limiter.middleware.js";
import { createTask, getTasks, getTaskById, updateTask, deleteTask, getTaskSummary } from "../controllers/task.controller.js";
import * as commentController from "../controllers/comment.controller.js";
import * as activityController from "../controllers/activity.controller.js";
import * as labelController from "../controllers/label.controller.js";
import { requireCSRF } from "../middleware/csrf.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createTaskSchema, updateTaskSchema, listTasksSchema } from "../schemas/task.schema.js";
import { createCommentSchema } from "../schemas/comment.schema.js";
import { attachLabelsSchema } from "../schemas/label.schema.js";
import { idParamSchema, uuidParam } from "../schemas/common.schema.js";

const taskIdParamSchema = uuidParam("taskId");
const projectIdParamSchema = uuidParam("projectId");

const router = express.Router();

/**
 * GET /api/tasks — VIEW_TASKS
 * Allowed: ADMIN, PM, INTERN, CLIENT
 */
router.get("/", readLimiter, verifyToken, authorize("VIEW_TASKS"), validate(listTasksSchema, 'query'), getTasks);

/**
 * GET /api/tasks/projects/:projectId/summary — VIEW_TASKS
 * Allowed: ADMIN, PM, INTERN, CLIENT
 */
router.get("/projects/:projectId/summary", readLimiter, verifyToken, authorize("VIEW_TASKS"), validate(projectIdParamSchema, 'params'), getTaskSummary);

/**
 * GET /api/tasks/:id — VIEW_TASKS
 * Allowed: ADMIN, PM, INTERN, CLIENT
 */
router.get("/:id", readLimiter, verifyToken, authorize("VIEW_TASKS"), validate(idParamSchema, 'params'), getTaskById);

/**
 * POST /api/tasks — CREATE_TASK
 * Allowed: ADMIN, PM
 */
router.post("/", writeLimiter, verifyToken, authorize("CREATE_TASK"), requireCSRF, validate(createTaskSchema), createTask);

/**
 * PATCH /api/tasks/:id — UPDATE_TASK
 * Allowed: ADMIN, PM, INTERN
 */
router.patch("/:id", writeLimiter, verifyToken, authorize("UPDATE_TASK"), requireCSRF, validate(idParamSchema, 'params'), validate(updateTaskSchema), updateTask);

/**
 * Allowed: ADMIN, PM, INTERN
 */
router.delete("/:id", writeLimiter, verifyToken, authorize(["DELETE_TASK", "DELETE_OWN_TASK"]), requireCSRF, validate(idParamSchema, 'params'), deleteTask);

/**
 * Comments
 */
router.post("/:taskId/comments", writeLimiter, verifyToken, authorize("UPDATE_TASK"), requireCSRF, validate(taskIdParamSchema, 'params'), validate(createCommentSchema), commentController.createComment);
router.get("/:taskId/comments", readLimiter, verifyToken, authorize("VIEW_TASKS"), validate(taskIdParamSchema, 'params'), commentController.getComments);

/**
 * Activity Log
 */
router.get("/:taskId/activities", readLimiter, verifyToken, authorize("VIEW_TASKS"), validate(taskIdParamSchema, 'params'), activityController.getTaskActivities);

/**
 * Labels
 */
router.post("/:taskId/labels", writeLimiter, verifyToken, authorize("UPDATE_TASK"), requireCSRF, validate(taskIdParamSchema, 'params'), validate(attachLabelsSchema), labelController.attachLabelsToTask);

export default router;
