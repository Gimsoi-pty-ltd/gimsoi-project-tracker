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
 * GET /api/employees/me/workload
 * Returns workload information for the authenticated employee.
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
