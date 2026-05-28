import express from 'express';
import { verifyToken } from '../middleware/verify-token.middleware.js';
import authorize from '../middleware/auth.middleware.js';
import { readLimiter, writeLimiter } from '../middleware/rate-limiter.middleware.js';
import { requireCSRF } from '../middleware/csrf.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
    createReportHandler,
    getReportsHandler,
    getReportPdfHandler,
    createReportSchema,
} from '../controllers/report.controller.js';

const router = express.Router();

/**
 * GET /api/reports — VIEW_REPORTS
 * Allowed: ADMIN, PM
 */
router.get('/', readLimiter, verifyToken, authorize('VIEW_REPORTS'), getReportsHandler);

/**
 * GET /api/reports/:id/pdf — VIEW_REPORTS
 * Allowed: ADMIN, PM
 */
router.get('/:id/pdf', readLimiter, verifyToken, authorize('VIEW_REPORTS'), getReportPdfHandler);

/**
 * POST /api/reports — MANAGE_REPORTS
 * Allowed: ADMIN, PM
 */
router.post('/', writeLimiter, verifyToken, authorize('MANAGE_REPORTS'), requireCSRF, validate(createReportSchema), createReportHandler);

export default router;
