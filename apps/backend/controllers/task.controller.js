import * as taskService from "../services/task.service.js";
import { parsePagination, buildPage } from "../utils/pagination.js";

export const createTask = async (req, res, next) => {
    try {
        const { title, description, projectId, sprintId, phaseId, assigneeId, priority, severity, storyPoints, estimatedHours, actualHours, isBlocked, dueDate } = req.body;

        if (!title || !projectId) {
            return res.status(400).json({ success: false, message: "Task title and projectId are required" });
        }

        const task = await taskService.createTask({
            taskData: { title, description, priority, severity, storyPoints, estimatedHours, actualHours, isBlocked, dueDate },
            context: { projectId, sprintId, phaseId, assigneeId, reporterId: req.user.id },
            requestingUser: { role: req.user.role, id: req.user.id }
        });

        return res.status(201).json({ success: true, message: "Task created successfully", data: task });
    } catch (err) {
        next(err);
    }
};

export const getTasks = async (req, res, next) => {
    try {
        const { projectId, status, isBlocked, isOverdue, sortBy } = req.query;
        const { limit, cursor } = parsePagination(req.query);

        const tasks = await taskService.getTasksByProject(projectId, req.user, {
            limit,
            cursor,
            status,
            isBlocked,
            isOverdue,
            sortBy
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
        return res.status(200).json({ success: true, data: task });
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

        return res.status(204).send();
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

export const bulkUpdateTasks = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { tasks, updateData } = req.body;
        const result = await taskService.bulkUpdateTasks(projectId, tasks, updateData, req.user?.id, req.user?.role);
        return res.status(200).json({ success: true, message: `Successfully updated ${result.count} tasks`, data: result });
    } catch (err) {
        next(err);
    }
};

export const bulkDeleteTasks = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { tasks } = req.body;
        const result = await taskService.bulkDeleteTasks(projectId, tasks, req.user?.id, req.user?.role);
        return res.status(200).json({ success: true, message: `Successfully deleted ${result.count} tasks`, data: result });
    } catch (err) {
        next(err);
    }
};
