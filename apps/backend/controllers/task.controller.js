import * as taskService from "../services/task.service.js";
import { parsePagination, buildPage } from "../utils/pagination.js";

export const createTask = async (req, res) => {
    try {
        const { title, description, projectId, sprintId, assigneeId, priority, isBlocked, dueDate } = req.body;

        if (!title || !projectId) {
            return res.status(400).json({ success: false, message: "Task title and projectId are required" });
        }

        const task = await taskService.createTask({
            title,
            description,
            projectId,
            sprintId,
            assigneeId,
            priority,
            isBlocked,
            dueDate,
            reporterId: req.user.id,
            userRole: req.user.role
        });

        return res.status(201).json({ success: true, message: "Task created successfully", data: task });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message || "Failed to create task" });
    }
};

export const getTasks = async (req, res) => {
    try {
        const { projectId, status, isBlocked, isOverdue } = req.query;

        const { limit, cursor } = parsePagination(req.query);

        if (!projectId) {
            return res.status(400).json({ success: false, message: "projectId query parameter is required" });
        }

        // Handle isBlocked boolean conversion
        let blockedFilter = undefined;
        if (isBlocked === 'true') blockedFilter = true;
        if (isBlocked === 'false') blockedFilter = false;

        let overdueFilter = undefined;
        if (isOverdue === 'true') overdueFilter = true;

        const records = await taskService.getTasksByProject(projectId, {
            limit,
            cursor,
            status,
            isBlocked: blockedFilter,
            isOverdue: overdueFilter
        });

        const { data, nextCursor } = buildPage(records, limit);

        return res.status(200).json({ success: true, data, nextCursor });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message || "Failed to fetch tasks" });
    }
};

export const getTaskById = async (req, res, next) => {
    try {
        const task = await taskService.getTaskById(req.params.id);
        res.status(200).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, sprintId, assigneeId, priority, isBlocked, dueDate } = req.body;

        const updated = await taskService.updateTask(id, {
            title, description, status, sprintId, assigneeId, priority, isBlocked, dueDate
        }, req.user?.id, req.user?.role);

        return res.status(200).json({ success: true, message: "Task updated successfully", data: updated });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message || "Failed to update task" });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await taskService.deleteTask(id, req.user?.id, req.user?.role);

        return res.status(200).json({ success: true, message: "Task deleted successfully" });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message || "Failed to delete task" });
    }
};

export const getTaskSummary = async (req, res) => {
    try {
        const { projectId } = req.params;
        const summary = await taskService.getProjectTaskSummary(projectId);
        return res.status(200).json({ success: true, data: summary });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message || "Failed to fetch task summary" });
    }
};
