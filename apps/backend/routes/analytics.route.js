import express from 'express';
import { verifyToken } from '../middleware/verify-token.middleware.js';
import authorize from '../middleware/authorize.middleware.js';
import { readLimiter } from '../middleware/rate-limiter.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { getTeamPerformanceHandler } from '../controllers/analytics.controller.js';
import { teamAnalyticsSchema } from '../schemas/analytics.schema.js';

const router = express.Router();

/**
 * GET /api/analytics/team — VIEW_ANALYTICS
 * Allowed: ADMIN, PM
 */
router.get('/team', readLimiter, verifyToken, authorize('VIEW_ANALYTICS'), validate(teamAnalyticsSchema, 'query'), getTeamPerformanceHandler);

export default router;
