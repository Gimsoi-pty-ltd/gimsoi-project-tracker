import { z } from 'zod';
import {
    createPhase,
    getPhasesByProject,
    getPhaseById,
    updatePhase,
    deletePhase,
} from '../services/phase.service.js';

export const createPhaseSchema = z.object({
    name: z.string().min(1, 'Phase name is required'),
    description: z.string().optional(),
    projectId: z.string().uuid('projectId must be a valid UUID'),
    startDate: z.string().datetime({ offset: true }).optional().or(z.literal('')).nullish(),
    endDate: z.string().datetime({ offset: true }).optional().or(z.literal('')).nullish(),
    order: z.number().int().min(0).optional(),
});

export const updatePhaseSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    startDate: z.string().datetime({ offset: true }).optional().or(z.literal('')).nullish(),
    endDate: z.string().datetime({ offset: true }).optional().or(z.literal('')).nullish(),
    order: z.number().int().min(0).optional(),
}).strict();

export const createPhaseHandler = async (req, res, next) => {
    try {
        const phase = await createPhase({ 
            ...req.body, 
            userId: req.user.id, 
            userRole: req.user.role 
        });
        return res.status(201).json({ success: true, data: phase });
    } catch (err) {
        next(err);
    }
};

export const getPhasesByProjectHandler = async (req, res, next) => {
    try {
        const { projectId } = req.query;
        const phases = await getPhasesByProject(projectId);
        return res.status(200).json({ success: true, data: phases });
    } catch (err) {
        next(err);
    }
};

export const getPhaseByIdHandler = async (req, res, next) => {
    try {
        const phase = await getPhaseById(req.params.id);
        return res.status(200).json({ success: true, data: phase });
    } catch (err) {
        next(err);
    }
};

export const updatePhaseHandler = async (req, res, next) => {
    try {
        const phase = await updatePhase(req.params.id, req.body, req.user.id, req.user.role);
        return res.status(200).json({ success: true, data: phase });
    } catch (err) {
        next(err);
    }
};

export const deletePhaseHandler = async (req, res, next) => {
    try {
        await deletePhase(req.params.id, req.user.id, req.user.role);
        return res.status(200).json({ success: true, message: 'Phase deleted.' });
    } catch (err) {
        next(err);
    }
};
