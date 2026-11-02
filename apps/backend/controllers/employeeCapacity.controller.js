import { asyncHandler } from "../middleware/async-handler.middleware.js";
import { parsePagination, buildPage } from "../utils/pagination.js";
import {
    getEmployeeCapacityOverview,
    getEmployeeCapacity,
    getEmployeeAssignedTasks,
} from "../services/employeeCapacity.service.js";

export const listEmployeeCapacity = asyncHandler(async (req, res) => {
    const data = await getEmployeeCapacityOverview({
        projectId: req.query.projectId,
        userId: req.user.id,
        userRole: req.user.role,
    });

    return res.status(200).json({ success: true, data });
});

export const getEmployeeCapacityById = asyncHandler(async (req, res) => {
    const data = await getEmployeeCapacity({
        employeeId: req.params.id,
        projectId: req.query.projectId,
        userId: req.user.id,
        userRole: req.user.role,
    });

    return res.status(200).json({ success: true, data });
});

export const getEmployeeTasks = asyncHandler(async (req, res) => {
    const { limit, cursor } = parsePagination(req.query);

    const records = await getEmployeeAssignedTasks({
        employeeId: req.params.id,
        projectId: req.query.projectId,
        status: req.query.status,
        limit,
        cursor,
        userId: req.user.id,
        userRole: req.user.role,
    });

    const { data, nextCursor } = buildPage(records, limit);

    return res.status(200).json({ success: true, data, nextCursor });
});