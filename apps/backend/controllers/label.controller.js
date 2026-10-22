import * as labelService from "../services/label.service.js";

export const createLabel = async (req, res, next) => {
    try {
        const label = await labelService.createLabel({
            userId: req.user.id,
            userRole: req.user.role,
            ...req.body
        });

        res.status(201).json({
            success: true,
            data: label
        });
    } catch (err) {
        next(err);
    }
};

export const getLabels = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const labels = await labelService.getLabelsByProject(projectId, req.user.id, req.user.role);

        res.json({
            success: true,
            data: labels
        });
    } catch (err) {
        next(err);
    }
};

export const updateLabel = async (req, res, next) => {
    try {
        const { id } = req.params;

        const label = await labelService.updateLabel(id, req.body, req.user.id, req.user.role);

        res.json({
            success: true,
            data: label
        });
    } catch (err) {
        next(err);
    }
};

export const deleteLabel = async (req, res, next) => {
    try {
        const { id } = req.params;
        await labelService.deleteLabel(id, req.user.id, req.user.role);

        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

export const attachLabelsToTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;

        const task = await labelService.attachLabelsToTask(taskId, req.body.labelIds, req.user.id, req.user.role);

        res.json({
            success: true,
            data: task
        });
    } catch (err) {
        next(err);
    }
};
