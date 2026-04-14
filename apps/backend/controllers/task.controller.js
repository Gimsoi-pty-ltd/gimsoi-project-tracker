import * as taskService from "../services/task.service.js";
import { parsePagination, buildPage } from "../utils/pagination.js";

export const createTask = async (req, res, next) => {
    try {
        const { title, description, projectId, sprintId, assigneeId, priority, isBlocked, dueDate } = req.body;

        if (!title || !projectId) {
            return res.status(400).json({ success: false, message: "Task title and projectId are required" });
        }

        const task = await taskService.createTask({
            taskData: { title, description, priority, isBlocked, dueDate },
            context: { projectId, sprintId, assigneeId, reporterId: req.user.id },
            requestingUser: { role: req.user.role, id: req.user.id }
        });

        return res.status(201).json({ success: true, message: "Task created successfully", data: task });
    } catch (err) {
        next(err);
    }
};

export const getTasks = async (req, res, next) => {
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
        if (isOverdue === 'false') overdueFilter = false;

        const tasks = await taskService.getTasksByProject(projectId, {
            limit,
            cursor,
            status,
            isBlocked: blockedFilter,
            isOverdue: overdueFilter
        });

        const { data, nextCursor } = buildPage(tasks, limit);

        return res.status(200).json({ success: true, data, nextCursor });
    } catch (err) {
        next(err);
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

export const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await taskService.updateTask(id, req.body, req.user?.id, req.user?.role);

        return res.status(200).json({ success: true, message: "Task updated successfully", data: updated });
    } catch (err) {
        next(err);
    }
};

export const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        await taskService.deleteTask(id, req.user?.id, req.user?.role);

        return res.status(200).json({ success: true, message: "Task deleted successfully" });
    } catch (err) {
        next(err);
    }
};

export const getTaskSummary = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const summary = await taskService.getProjectTaskSummary(projectId);
        return res.status(200).json({ success: true, data: summary });
    } catch (err) {
        next(err);
    }
};
