import { hasPermission } from '../constants/permissions.js';

/**
 * Injects req.analyticsScope — drives all data isolation in the analytics controller.
 *
 * Scope shape:
 *   canViewProject      {boolean}  — gates project_analytics block
 *   canViewTeam         {boolean}  — gates team_analytics block
 *   isAdmin             {boolean}  — true only for ADMIN (VIEW_ALL_ANALYTICS permission)
 *   projectFilter       {object|null} — Prisma WHERE clause for Project/Task ORM queries
 *   taskFilter          {object}   — Prisma WHERE clause for Task ORM queries
 *   userFilter          {object}   — Prisma WHERE clause for User ORM queries
 *   ownerIdForRaw       {string|null} — userId to inject into raw SQL owner clauses (null = admin, no filter)
 *
 * Time filters are applied via taskFilter.createdAt (ORM) or passed separately to raw SQL via
 * the controller, which reads req.query.startDate / req.query.endDate directly.
 */
export const injectAnalyticsScope = (req, res, next) => {
    const { role, id } = req.user;
    const { startDate, endDate, projectId } = req.query;

    // Build time filter object for Prisma ORM queries
    const createdAtFilter = {};
    if (startDate) createdAtFilter.gte = new Date(startDate);
    if (endDate)   createdAtFilter.lte = new Date(endDate);
    const hasTimeFilter = Object.keys(createdAtFilter).length > 0;

    // VIEW_ALL_ANALYTICS is ADMIN-only — the clean boundary between ADMIN and PM.
    // PM shares MANAGE_PROJECTS + UPDATE_ANY_TASK with ADMIN, so those cannot distinguish.
    const isAdmin = hasPermission(role, 'VIEW_ALL_ANALYTICS');

    if (hasPermission(role, 'MANAGE_PROJECTS')) {
        // ADMIN: global scope (no owner filter)
        // PM:    scoped to projects they created
        const projectFilter = isAdmin ? {} : { createdByUserId: id };
        const taskProjectFilter = isAdmin ? {} : { project: { createdByUserId: id } };

        req.analyticsScope = {
            canViewProject: true,
            canViewTeam: true,
            isAdmin,
            projectFilter,
            taskFilter: {
                ...taskProjectFilter,
                ...(projectId ? { projectId: String(projectId) } : {}),
                ...(hasTimeFilter ? { createdAt: createdAtFilter } : {}),
            },
            userFilter: isAdmin
                ? {}
                : { assignedTasks: { some: { project: { createdByUserId: id } } } },
            // null = admin (no WHERE clause needed); string = PM's userId for raw SQL
            ownerIdForRaw: isAdmin ? null : id,
        };
    } else {
        // INTERN / CLIENT: strictly self-isolated
        req.analyticsScope = {
            canViewProject: false,
            canViewTeam: false,
            isAdmin: false,
            projectFilter: null,
            taskFilter: {
                assigneeId: id,
                ...(projectId ? { projectId: String(projectId) } : {}),
                ...(hasTimeFilter ? { createdAt: createdAtFilter } : {}),
            },
            userFilter: { id },
            ownerIdForRaw: id, // self-only raw queries
        };
    }

    next();
};
