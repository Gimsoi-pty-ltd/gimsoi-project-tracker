import express from 'express';
import { z } from 'zod';
import { verifyToken } from '../middleware/verify-token.middleware.js';
import authorize from '../middleware/authorize.middleware.js';
import { readLimiter, writeLimiter } from '../middleware/rate-limiter.middleware.js';
import { requireCSRF } from '../middleware/csrf.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
    createPhaseHandler,
    getPhasesByProjectHandler,
    getPhaseByIdHandler,
    updatePhaseHandler,
    deletePhaseHandler,
    createPhaseSchema,
    updatePhaseSchema,
} from '../controllers/phase.controller.js';

const router = express.Router();

// Specific schema for the list query
const listPhasesSchema = z.object({
    projectId: z.string().uuid('projectId must be a valid UUID')
});

/**
 * GET /api/phases?projectId= — VIEW_PHASES
 * Allowed: ADMIN, PM, INTERN, CLIENT
 */
router.get('/', readLimiter, verifyToken, authorize('VIEW_PHASES'), validate(listPhasesSchema, 'query'), getPhasesByProjectHandler);

/**
 * GET /api/phases/:id — VIEW_PHASES
 * Allowed: ADMIN, PM, INTERN, CLIENT
 */
router.get('/:id', readLimiter, verifyToken, authorize('VIEW_PHASES'), getPhaseByIdHandler);

/**
 * POST /api/phases — MANAGE_PHASES
 * Allowed: ADMIN, PM
 */
router.post('/', writeLimiter, verifyToken, authorize('MANAGE_PHASES'), requireCSRF, validate(createPhaseSchema), createPhaseHandler);

/**
 * PATCH /api/phases/:id — MANAGE_PHASES
 * Allowed: ADMIN, PM
 */
router.patch('/:id', writeLimiter, verifyToken, authorize('MANAGE_PHASES'), requireCSRF, validate(updatePhaseSchema), updatePhaseHandler);

/**
 * DELETE /api/phases/:id — MANAGE_PHASES
 * Allowed: ADMIN, PM
 */
router.delete('/:id', writeLimiter, verifyToken, authorize('MANAGE_PHASES'), requireCSRF, deletePhaseHandler);

export default router;
