import * as sprintService from "../services/sprint.service.js";
import { parsePagination, buildPage } from "../utils/pagination.js";

export const createSprint = async (req, res, next) => {
    try {
        const { name, projectId, status, startDate, endDate } = req.body;

        if (!name || !projectId) {
            return res.status(400).json({ success: false, message: "Sprint name and projectId are required" });
        }

        const sprint = await sprintService.createSprint({
            name,
            projectId,
            status,
            startDate,
            endDate,
            goal: req.body.goal,
            createdByUserId: req.user.id
        });

        return res.status(201).json({ success: true, message: "Sprint created", data: sprint });
    } catch (err) {
        next(err);
    }
};

export const getSprints = async (req, res, next) => {
    try {
        const { projectId } = req.query;

        if (!projectId) {
            return res.status(400).json({ success: false, message: "projectId query parameter is required" });
        }

        const { limit, cursor } = parsePagination(req.query);

        const records = await sprintService.getSprintsByProject(projectId, { limit, cursor });

        const { data, nextCursor } = buildPage(records, limit);

        return res.status(200).json({ success: true, data, nextCursor });
    } catch (err) {
        next(err);
    }
};

export const updateSprintStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, version } = req.body;

        const updated = await sprintService.updateSprintStatus(id, status, req.user.id, req.user.role, version);

        return res.status(200).json({ success: true, message: "Sprint state updated successfully", data: updated });
    } catch (err) {
        next(err);
    }
};

export const updateSprint = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, startDate, endDate, goal, version } = req.body;

        const updated = await sprintService.updateSprint(id, { name, startDate, endDate, goal, version }, req.user.id, req.user.role);

        return res.status(200).json({ success: true, message: "Sprint updated successfully", data: updated });
    } catch (err) {
        next(err);
    }
};

export const getSprintVelocity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const velocity = await sprintService.getSprintVelocity(id);
        return res.status(200).json({ success: true, data: velocity });
    } catch (err) {
        next(err);
    }
};
export const getSprintMetrics = async (req, res, next) => {
    try {
        const { id } = req.params;
        const metrics = await sprintService.getSprintMetrics(id);
        return res.status(200).json({ success: true, data: metrics });
    } catch (err) {
        next(err);
    }
};
