import express from 'express';
import { verifyToken } from '../middleware/verify-token.middleware.js';
import authorize from '../middleware/auth.middleware.js';
import { requireAnyRole } from "../middleware/rbac.middleware.js";
import { readLimiter } from '../middleware/rate-limiter.middleware.js';
import { injectAnalyticsScope } from "../middleware/analyticsScope.middleware.js";
import { validate } from '../middleware/validate.middleware.js';
import {
    getTeamPerformanceHandler,
    teamAnalyticsSchema,
    getAIContext,
    ingestHealthScore
} from '../controllers/analytics.controller.js';
import { requireCSRF } from '../middleware/csrf.middleware.js';
import { writeLimiter } from '../middleware/rate-limiter.middleware.js';

const router = express.Router();

/**
 * POST /api/analytics/health-score
 */
router.post('/health-score', writeLimiter, verifyToken, authorize('VIEW_ANALYTICS'), requireCSRF, ingestHealthScore);

/**
 * POST /api/analytics/metrics
 */
router.post('/metrics', writeLimiter, verifyToken, authorize('VIEW_ANALYTICS'), requireCSRF, ingestHealthScore);

/**
 * GET /api/analytics/team — VIEW_ANALYTICS
 * Allowed: ADMIN, PM
 */
router.get('/team', readLimiter, verifyToken, authorize('VIEW_ANALYTICS'), validate(teamAnalyticsSchema, 'query'), getTeamPerformanceHandler);

/**
 * GET /api/analytics/ai-context
 *
 * Query params:
 *   projectId  {uuid}   — scope all analytics to a single project
 *   startDate  {date}   — ISO-8601 date, filters task createdAt (>=)
 *   endDate    {date}   — ISO-8601 date, filters task createdAt (<=)
 *   cursor     {uuid}   — keyset pagination cursor (last user id from previous page)
 *   limit      {int}    — page size, max 50, default 10
 *
 * Roles: ADMIN (global), PM (own projects), INTERN/CLIENT (own tasks/user entry only)
 */
router.get(
    "/ai-context",
    readLimiter,
    verifyToken,
    requireAnyRole(["ADMIN", "PM", "INTERN"]),
    injectAnalyticsScope,
    getAIContext
);

export default router;
