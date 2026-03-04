import * as taskService from "../services/task.service.js";

export const createTask = async (req, res) => {
    try {
        const { title, description, projectId, sprintId, assigneeId } = req.body;

        if (!title || !projectId) {
            return res.status(400).json({ success: false, message: "Task title and projectId are required" });
        }

        const task = await taskService.createTask({
            title,
            description,
            projectId,
            sprintId,
            assigneeId,
            reporterId: req.user.id
        });

        return res.status(201).json({ success: true, message: "Task created successfully", data: task });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message || "Failed to create task" });
    }
};

export const getTasks = async (req, res) => {
    try {
        const { projectId } = req.query;

        const limit = Math.min(parseInt(req.query.limit) || 50, 100); // max 100
        const cursor = req.query.cursor || undefined;

        if (!projectId) {
            return res.status(400).json({ success: false, message: "projectId query parameter is required" });
        }

        const tasks = await taskService.getTasksByProject(projectId, { limit, cursor });
        return res.status(200).json({ success: true, data: tasks });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message || "Failed to fetch tasks" });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, sprintId, assigneeId } = req.body;

        const updated = await taskService.updateTask(id, {
            title, description, status, sprintId, assigneeId
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
