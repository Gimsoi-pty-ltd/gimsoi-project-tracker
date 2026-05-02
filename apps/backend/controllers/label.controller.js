import * as labelService from "../services/label.service.js";
import { createLabelSchema, attachLabelsSchema } from "../schemas/label.schema.js";

export const createLabel = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const validated = createLabelSchema.parse(req.body);
        
        const label = await labelService.createLabel({
            projectId,
            userId: req.user.id,
            userRole: req.user.role,
            ...validated
        });
        
        res.status(201).json({
            status: "success",
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
            status: "success",
            data: labels
        });
    } catch (err) {
        next(err);
    }
};

export const updateLabel = async (req, res, next) => {
    try {
        const { id } = req.params;
        const validated = createLabelSchema.parse(req.body);
        
        const label = await labelService.updateLabel(id, validated, req.user.id, req.user.role);
        
        res.json({
            status: "success",
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
        const validated = attachLabelsSchema.parse(req.body);
        
        const task = await labelService.attachLabelsToTask(taskId, validated.labelIds, req.user.id, req.user.role);
        
        res.json({
            status: "success",
            data: task
        });
    } catch (err) {
        next(err);
    }
};
