import * as sprintService from "../services/sprint.service.js";

export const createSprint = async (req, res) => {
    try {
        const { name, projectId, status } = req.body;

        if (!name || !projectId) {
            return res.status(400).json({ success: false, message: "Sprint name and projectId are required" });
        }

        const sprint = await sprintService.createSprint({
            name,
            projectId,
            status,
            createdByUserId: req.user.id
        });

        return res.status(201).json({ success: true, message: "Sprint created", data: sprint });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message || "Failed to create sprint" });
    }
};

export const getSprints = async (req, res) => {
    try {
        const { projectId } = req.query;

        if (!projectId) {
            return res.status(400).json({ success: false, message: "projectId query parameter is required" });
        }

        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const cursor = req.query.cursor || undefined;

        const records = await sprintService.getSprintsByProject(projectId, { limit, cursor });

        const hasMore = records.length > limit;
        const data = hasMore ? records.slice(0, limit) : records;
        const nextCursor = hasMore ? data[data.length - 1].id : null;

        return res.status(200).json({ success: true, data, nextCursor });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message || "Failed to fetch sprints" });
    }
};

export const updateSprintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: "status is required to update sprint state" });
        }

        const updated = await sprintService.updateSprintStatus(id, status, req.user.id, req.user.role);

        return res.status(200).json({ success: true, message: "Sprint state updated successfully", data: updated });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message || "Failed to update sprint state" });
    }
};
