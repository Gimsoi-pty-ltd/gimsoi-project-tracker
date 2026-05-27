import * as analyticsService from "../services/analytics.service.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";

export const getAIContext = asyncHandler(async (req, res) => {
    const { canViewProject, canViewTeam, taskFilter, ownerIdForRaw } = req.analyticsScope;
    const { projectId, cursor, limit: rawLimit, startDate, endDate } = req.query;
    const limit = Math.min(parseInt(rawLimit, 10) || 10, 50);

    const payload = {
        generated_at: new Date().toISOString(),
        filters_applied: {
            projectId: projectId ?? null,
            startDate: startDate ?? null,
            endDate:   endDate   ?? null,
            cursor:    cursor    ?? null,
            limit,
        },
        data: {
            project_analytics: null,
            team_analytics:    null,
            user_analytics:    [],
            nextCursor:        null,
        },
    };

    /* --- PROJECT ANALYTICS --- */
    if (canViewProject) {
        payload.data.project_analytics = await analyticsService.getProjectAnalytics({
            projectId,
            taskFilter,
            ownerIdForRaw
        });
    }

    /* --- TEAM ANALYTICS --- */
    if (canViewTeam) {
        payload.data.team_analytics = await analyticsService.getTeamAnalytics({
            projectId,
            ownerIdForRaw
        });
    }

    /* --- USER ANALYTICS --- */
    const userRows = await analyticsService.getUserAnalyticsList({
        projectId,
        ownerIdForRaw,
        canViewTeam,
        cursor,
        limit
    });

    payload.data.user_analytics = userRows;
    payload.data.nextCursor = userRows.length === limit
        ? userRows[userRows.length - 1].id
        : null;

    return res.status(200).json({ success: true, ...payload });
});


