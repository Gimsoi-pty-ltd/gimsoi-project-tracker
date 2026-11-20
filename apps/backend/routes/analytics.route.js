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
    ingestHealthScore,
    getProjectHealthHandler
} from '../controllers/analytics.controller.js';
import { requireCSRF } from '../middleware/csrf.middleware.js';
import { writeLimiter } from '../middleware/rate-limiter.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Analytics & Health
 *     description: Project health calculations, metrics ingestion, and analytics context
 */

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
 * @swagger
 * /api/analytics/project-health/{projectId}:
 *   get:
 *     summary: Get project health analytics
 *     description: |
 *       Retrieves aggregated health analytics and sync metadata for a specified project.
 *       
 *       **Authorization & Ownership:**
 *       - Requires authentication (Bearer token or session cookie).
 *       - Allowed roles: `ADMIN`, `PM`.
 *       - `ADMIN` can access health analytics for any project.
 *       - `PM` can only access health analytics for projects they created/own. If a PM attempts to access a project owned by another user, the API responds with a `404 Not Found` (to avoid leaking project existence).
 *       - Other roles (`INTERN`, `CLIENT`) receive `403 Forbidden`.
 *       
 *       **Calculations & Data Source:**
 *       - Reads from the `ProjectAnalytics` record linked to the project.
 *       - If analytics record exists: returns task totals (`totalTasks`, `completedTasks`, `blockedTasks`, `cancelledTasks`), sprint statistics (`totalSprints`, `activeSprints`), and sync metadata (`syncStatus`, `lastSyncedAt`).
 *       - If analytics record has not been generated yet: returns `syncStatus: "pending"` with message `"No analytics data available yet"`.
 *     tags:
 *       - Analytics & Health
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID (UUID) of the project
 *         example: "a81d428e-5b1b-4f90-8e6d-53c89b2d9213"
 *     responses:
 *       200:
 *         description: Project health analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   oneOf:
 *                     - type: object
 *                       properties:
 *                         projectId:
 *                           type: string
 *                           example: "a81d428e-5b1b-4f90-8e6d-53c89b2d9213"
 *                         totalTasks:
 *                           type: integer
 *                           example: 24
 *                         completedTasks:
 *                           type: integer
 *                           example: 18
 *                         blockedTasks:
 *                           type: integer
 *                           example: 2
 *                         cancelledTasks:
 *                           type: integer
 *                           example: 1
 *                         totalSprints:
 *                           type: integer
 *                           example: 3
 *                         activeSprints:
 *                           type: integer
 *                           example: 1
 *                         lastSyncedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2026-11-19T12:00:00.000Z"
 *                         syncStatus:
 *                           type: string
 *                           enum: [synced, error, pending]
 *                           example: "synced"
 *                     - type: object
 *                       properties:
 *                         projectId:
 *                           type: string
 *                           example: "a81d428e-5b1b-4f90-8e6d-53c89b2d9213"
 *                         syncStatus:
 *                           type: string
 *                           example: "pending"
 *                         message:
 *                           type: string
 *                           example: "No analytics data available yet"
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized - no token provided"
 *       403:
 *         description: Forbidden - user does not have permission (e.g. INTERN, CLIENT)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden"
 *       404:
 *         description: Project not found or belongs to another PM
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Project not found"
 */
router.get('/project-health/:projectId', readLimiter, verifyToken, requireAnyRole(['ADMIN', 'PM']), getProjectHealthHandler);

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
