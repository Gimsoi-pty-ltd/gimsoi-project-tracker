import {
    createPhase,
    getPhasesByProject,
    getPhaseById,
    updatePhase,
    deletePhase,
    getMilestoneStatus,
} from '../services/phase.service.js';
import { parsePagination, buildPage } from '../utils/pagination.js';

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
        const { limit } = parsePagination(req.query);
        const records = await getPhasesByProject(projectId, req.query, req.user.id, req.user.role);
        const { data, nextCursor } = buildPage(records, limit);
        return res.status(200).json({ success: true, data, nextCursor });
    } catch (err) {
        next(err);
    }
};

export const getPhaseByIdHandler = async (req, res, next) => {
    try {
        const phase = await getPhaseById(req.params.id, req.user.id, req.user.role);
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
export const getMilestoneStatusHandler = async (req, res, next) => {
    try {
        const status = await getMilestoneStatus(req.params.id, req.user.id, req.user.role);
        return res.status(200).json({ success: true, data: status });
    } catch (err) {
        next(err);
    }
};
