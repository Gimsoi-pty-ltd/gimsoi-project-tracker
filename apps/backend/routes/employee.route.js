import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import { requireAnyRole } from "../middleware/rbac.middleware.js";
import { readLimiter } from "../middleware/rate-limiter.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
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

const router = express.Router();

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