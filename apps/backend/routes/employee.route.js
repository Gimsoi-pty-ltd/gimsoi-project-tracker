import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import { requireAnyRole } from "../middleware/rbac.middleware.js";
import { readLimiter } from "../middleware/rate-limiter.middleware.js";
import { validate } from "../middleware/validate.middleware.js"; 
import { getMyWorkloadController } from "../controllers/workload.controller.js";
import {
    listEmployeeCapacity,
    getEmployeeCapacityById,
    getEmployeeTasks,
} from "../controllers/employeeCapacity.controller.js";
import {
    employeeIdParamsSchema,
    capacityQuerySchema,
    assignedTasksQuerySchema,
} from "../schemas/employee.schema.js";
import prisma from "../lib/prisma.js";

const router = express.Router(); 

/**
 * @swagger
 * tags:
 *   - name: Workload Management
 *     description: Employee workload statistics, capacity planning, and daily focus tasks
 */

/**
 * @swagger
 * /api/employees/me/workload:
 *   get:
 *     summary: Get authenticated employee workload and Focus Today tasks
 *     description: |
 *       Retrieves the personal workload statistics and recommended Focus Today tasks for the currently authenticated employee.
 *       
 *       **Authorization & Role Permissions:**
 *       - Requires authentication (Bearer token or session cookie).
 *       - Allowed roles: `ADMIN`, `PM`, `INTERN`.
 *       - `CLIENT` users receive `403 Forbidden`.
 *       - Unauthenticated requests receive `401 Unauthorized`.
 *       
 *       **Scope & Filters:**
 *       - Only returns tasks assigned to the authenticated user (`assigneeId = req.user.id`).
 *       - Excludes soft-deleted tasks (`isDeleted = false`).
 *       - Excludes tasks belonging to soft-deleted projects (`project.isDeleted = false`).
 *       
 *       **Workload Statistics & Calculations:**
 *       - `activeTasks`: Count of assigned tasks with status in `['TODO', 'IN_PROGRESS', 'REVIEW', 'BLOCKED']`.
 *       - `completedTasks`: Count of assigned tasks with status `DONE`.
 *       - `overdueTasks`: Count of active tasks with `dueDate < current_time`.
 *       - `blockedTasks`: Count of active tasks where status is `BLOCKED` or `isBlocked = true`.
 *       - `activeStoryPoints`: Sum of `storyPoints` across active tasks (null story points are treated as 0).
 *       
 *       **South African Timezone (Africa/Johannesburg) & Focus Today Rules:**
 *       - Due dates are converted to South African calendar dates (`YYYY-MM-DD` in `Africa/Johannesburg`).
 *       - **Primary selection (`DUE_TODAY`):** If any tasks have `dueDate` matching today's South African date, focusMode is `DUE_TODAY`. Includes all statuses (even DONE tasks due today). Tasks are sorted by priority: `URGENT` (0) > `HIGH` (1) > `MEDIUM` (2) > `LOW` (3), secondary sort by nearest due date.
 *       - **Fallback selection (`UP_NEXT`):** If no tasks are due today, fallback tasks are chosen from active tasks (excluding DONE) that are `IN_PROGRESS` or upcoming (`dueDate > today`). Sorted by nearest upcoming date first, then by priority.
 *       - **Empty selection (`EMPTY`):** If no tasks match either criterion, `focusMode` is `EMPTY` and `focusTasks` is `[]`.
 *       - **Limit:** At most 5 focus tasks are returned in `focusTasks`.
 *     tags:
 *       - Workload Management
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Workload information retrieved successfully
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
 *                     employee:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a"
 *                         fullName:
 *                           type: string
 *                           example: "John Doe"
 *                         jobTitle:
 *                           type: string
 *                           nullable: true
 *                           example: "Full Stack Engineer"
 *                         role:
 *                           type: string
 *                           enum: [ADMIN, PM, INTERN]
 *                           example: "INTERN"
 *                     workload:
 *                       type: object
 *                       properties:
 *                         activeTasks:
 *                           type: integer
 *                           example: 3
 *                         completedTasks:
 *                           type: integer
 *                           example: 1
 *                         overdueTasks:
 *                           type: integer
 *                           example: 1
 *                         blockedTasks:
 *                           type: integer
 *                           example: 2
 *                         activeStoryPoints:
 *                           type: integer
 *                           example: 10
 *                     focusMode:
 *                       type: string
 *                       enum: [DUE_TODAY, UP_NEXT, EMPTY]
 *                       example: "DUE_TODAY"
 *                     focusTasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "9a8b7c6d-5e4f-3a2b-1c0d-ef9a8b7c6d5e"
 *                           title:
 *                             type: string
 *                             example: "Urgent Priority Task"
 *                           status:
 *                             type: string
 *                             enum: [TODO, IN_PROGRESS, REVIEW, BLOCKED, DONE, CANCELLED]
 *                             example: "IN_PROGRESS"
 *                           priority:
 *                             type: string
 *                             enum: [URGENT, HIGH, MEDIUM, LOW]
 *                             example: "URGENT"
 *                           storyPoints:
 *                             type: integer
 *                             nullable: true
 *                             example: 5
 *                           dueDate:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                             example: "2026-11-19T10:00:00.000Z"
 *                           isBlocked:
 *                             type: boolean
 *                             example: false
 *                           projectId:
 *                             type: string
 *                             example: "a81d428e-5b1b-4f90-8e6d-53c89b2d9213"
 *       401:
 *         description: Unauthorized - missing or invalid token
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
 *         description: Forbidden - role not allowed (e.g. CLIENT)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden"
 *       404:
 *         description: Employee profile not found
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
 *                   example: "Employee not found."
 */
router.get(
  "/me/workload",
  readLimiter,
  verifyToken,
  requireAnyRole(["ADMIN", "PM", "INTERN"]),
  getMyWorkloadController
);


/**
 * GET /api/employees
 * List employee members (users who are not CLIENT)
 */
router.get(
    "/",
    readLimiter,
    verifyToken,
    requireAnyRole(["ADMIN", "PM"]),
    async (req, res, next) => {
        try {
            const employees = await prisma.user.findMany({
                where: {
                    isDeleted: false,
                    role: { in: ["ADMIN", "PM", "INTERN"] },
                },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    role: true,
                    avatarUrl: true,
                    jobTitle: true,
                    phone: true,
                },
                orderBy: { fullName: "asc" },
            });
            return res.status(200).json({ success: true, data: employees });
        } catch (err) {
            next(err);
        }
    }
);

/**
 * GET /api/employees/capacity?projectId=
 * Workload for every employee. Allowed: ADMIN (all projects), PM (own projects).
 */
router.get(
    "/capacity",
    readLimiter,
    verifyToken,
    requireAnyRole(["ADMIN", "PM"]),
    validate(capacityQuerySchema, "query"),
    listEmployeeCapacity
);

/**
 * GET /api/employees/:id/capacity?projectId=
 * Workload for one employee. 404 when the employee does not exist.
 */
router.get(
    "/:id/capacity",
    readLimiter,
    verifyToken,
    requireAnyRole(["ADMIN", "PM"]),
    validate(employeeIdParamsSchema, "params"),
    validate(capacityQuerySchema, "query"),
    getEmployeeCapacityById
);

/**
 * GET /api/employees/:id/tasks?projectId=&status=&limit=&cursor=
 * Tasks assigned to one employee (paginated).
 */
router.get(
    "/:id/tasks",
    readLimiter,
    verifyToken,
    requireAnyRole(["ADMIN", "PM"]),
    validate(employeeIdParamsSchema, "params"),
    validate(assignedTasksQuerySchema, "query"),
    getEmployeeTasks
);

export default router;
