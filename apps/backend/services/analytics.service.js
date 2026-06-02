import prisma, { Prisma } from "../lib/prisma.js";
import { TASK_STATUS } from "../constants/statuses.js";

// Must match Prisma schema enum names exactly
const SPRINT_STATUS_ENUM = '"SprintStatus"';
const TASK_STATUS_ENUM   = '"TaskStatus"';

/**
 * Service layer for analytics logic.
 * Decouples complex data aggregations from the controller.
 */

export const getProjectAnalytics = async ({ projectId, taskFilter, ownerIdForRaw }) => {
    const statusCounts = await prisma.task.groupBy({
        by: ['status'],
        where: taskFilter,
        _count: { _all: true },
    });

    const state_distribution = {
        TODO: 0, IN_PROGRESS: 0, DONE: 0, CANCELLED: 0, BLOCKED: 0,
    };
    let totalTasks = 0;

    statusCounts.forEach(({ status, _count }) => {
        state_distribution[status] = _count._all;
        totalTasks += _count._all;
    });

    /* --- SCOPE CREEP INDEX --- */
    const queryParts = [Prisma.sql`
        SELECT COUNT(t.id)::int AS "creep_count"
        FROM   "Task"    t
        JOIN   "Sprint"  s ON t."sprintId" = s.id
        JOIN   "Project" p ON t."projectId" = p.id
        WHERE  t."createdAt" > s."startDate"
        AND    s.status = 'ACTIVE'::${Prisma.raw(SPRINT_STATUS_ENUM)}
    `];

    if (projectId) {
        queryParts.push(Prisma.sql`AND t."projectId" = ${projectId}`);
    }
    if (ownerIdForRaw) {
        queryParts.push(Prisma.sql`AND p."createdByUserId" = ${ownerIdForRaw}`);
    }

    const scopeCreepRows = await prisma.$queryRaw(Prisma.join(queryParts, ' '));
    const scopeCreepRow = scopeCreepRows[0];

    return {
        completion_percentage: totalTasks
            ? Math.round((state_distribution.DONE / totalTasks) * 100)
            : 0,
        state_distribution,
        scope_creep_index: { count: scopeCreepRow?.creep_count ?? 0 },
        bottleneck_labels: await getBottleneckLabels({ projectId, taskFilter, ownerIdForRaw }),
    };
};

const getBottleneckLabels = async ({ projectId, taskFilter, ownerIdForRaw }) => {
    const queryParts = [Prisma.sql`
        SELECT   l.name as label, COUNT(*)::int as count
        FROM     "Task" t
        JOIN     "Project" p ON t."projectId" = p.id
        JOIN     "_LabelToTask" lt ON lt."B" = t.id
        JOIN     "Label" l ON l.id = lt."A"
        WHERE    t.status IN ('BLOCKED'::${Prisma.raw(TASK_STATUS_ENUM)}, 'IN_PROGRESS'::${Prisma.raw(TASK_STATUS_ENUM)})
    `];

    if (projectId) {
        queryParts.push(Prisma.sql`AND t."projectId" = ${projectId}`);
    }
    if (ownerIdForRaw) {
        queryParts.push(Prisma.sql`AND p."createdByUserId" = ${ownerIdForRaw}`);
    }

    queryParts.push(Prisma.sql`GROUP BY l.name ORDER BY count DESC LIMIT 3`);

    const rows = await prisma.$queryRaw(Prisma.join(queryParts, ' '));
    return rows;
};

export const getTeamAnalytics = async ({ projectId, ownerIdForRaw }) => {
    const teamQueryParts = [Prisma.sql`
        SELECT   u.role::text                  AS role,
                 COUNT(t.id)::int              AS active_task_count
        FROM     "User"    u
        JOIN     "Task"    t ON t."assigneeId" = u.id
        JOIN     "Project" p ON t."projectId"  = p.id
        WHERE    t.status NOT IN ('DONE'::${Prisma.raw(TASK_STATUS_ENUM)}, 'CANCELLED'::${Prisma.raw(TASK_STATUS_ENUM)})
    `];

    if (projectId) {
        teamQueryParts.push(Prisma.sql`AND t."projectId" = ${projectId}`);
    }
    if (ownerIdForRaw) {
        teamQueryParts.push(Prisma.sql`AND p."createdByUserId" = ${ownerIdForRaw}`);
    }

    teamQueryParts.push(Prisma.sql`GROUP BY u.role ORDER BY active_task_count DESC`);

    const workloadRows = await prisma.$queryRaw(Prisma.join(teamQueryParts, ' '));

    return {
        workload_distribution: workloadRows.reduce((acc, r) => {
            acc[r.role] = r.active_task_count;
            return acc;
        }, {}),
        velocity_trend: await getVelocityTrend({ projectId, ownerIdForRaw }),
    };
};

const getVelocityTrend = async ({ projectId, ownerIdForRaw }) => {
    const queryParts = [Prisma.sql`
        SELECT   date_trunc('week', t."completedAt") as week,
                 COUNT(*)::int as completed_count
        FROM     "Task" t
        JOIN     "Project" p ON t."projectId" = p.id
        WHERE    t.status = 'DONE'::${Prisma.raw(TASK_STATUS_ENUM)}
        AND      t."completedAt" >= NOW() - INTERVAL '4 weeks'
    `];

    if (projectId) {
        queryParts.push(Prisma.sql`AND t."projectId" = ${projectId}`);
    }
    if (ownerIdForRaw) {
        queryParts.push(Prisma.sql`AND p."createdByUserId" = ${ownerIdForRaw}`);
    }

    queryParts.push(Prisma.sql`GROUP BY week ORDER BY week ASC`);

    const rows = await prisma.$queryRaw(Prisma.join(queryParts, ' '));
    return rows.map(r => ({
        week: r.week.toISOString().split('T')[0],
        count: r.completed_count
    }));
};

export const getUserAnalyticsList = async ({ projectId, ownerIdForRaw, canViewTeam, cursor, limit }) => {
    const STALE_THRESHOLD_MS = Date.now() - 48 * 60 * 60 * 1000;
    
    const userQueryParts = [Prisma.sql`
        SELECT
            u.id,
            u."fullName",
            u.role::text                                                               AS role,
            COUNT(CASE WHEN t.status NOT IN ('DONE'::${Prisma.raw(TASK_STATUS_ENUM)}, 'CANCELLED'::${Prisma.raw(TASK_STATUS_ENUM)}) THEN 1 END)::int    AS active_tasks,
            COUNT(CASE WHEN t.status = 'TODO'::${Prisma.raw(TASK_STATUS_ENUM)}
                       AND  t."createdAt" < to_timestamp(${STALE_THRESHOLD_MS} / 1000.0)
                       THEN 1 END)::int                                                AS stale_tasks
        FROM     "User" u
        LEFT JOIN "Task" t ON t."assigneeId" = u.id
        WHERE    1 = 1
    `];

    if (projectId) {
        userQueryParts.push(Prisma.sql`AND t."projectId" = ${projectId}`);
    }

    if (ownerIdForRaw && !canViewTeam) {
        userQueryParts.push(Prisma.sql`AND u.id = ${ownerIdForRaw}`);
    } else if (ownerIdForRaw) {
        userQueryParts.push(Prisma.sql`AND EXISTS (
            SELECT 1 FROM "Task" xt
            JOIN "Project" xp ON xt."projectId" = xp.id
            WHERE xt."assigneeId" = u.id
            AND   xp."createdByUserId" = ${ownerIdForRaw}
        )`);
    }

    if (cursor) {
        userQueryParts.push(Prisma.sql`AND u.id > ${cursor}`);
    }

    userQueryParts.push(Prisma.sql`
        GROUP BY u.id, u."fullName", u.role
        ORDER BY active_tasks DESC, u.id ASC
        LIMIT ${limit}
    `);

    return await prisma.$queryRaw(Prisma.join(userQueryParts, ' '));
};

/**
 * Calculates aggregated team performance metrics with pagination.
 * 
 * @param {object} options - Pagination options { limit, cursor }
 * @returns {Array} - List of users with their task counts and completion rates
 */
export const getTeamPerformance = async ({ limit = 20, cursor } = {}) => {
    const take = Math.min(Number(limit) || 20, 100);

    // Get paginated users with their assigned tasks
    const users = await prisma.user.findMany({
        take: take + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: 'asc' },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            avatarUrl: true,
            assignedTasks: {
                select: {
                    status: true
                }
            }
        }
    });

    return users.map(user => {
        const total = user.assignedTasks.length;
        const completed = user.assignedTasks.filter(t => t.status === TASK_STATUS.DONE).length;
        const open = user.assignedTasks.filter(t => [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.BLOCKED].includes(t.status)).length;
        
        return {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
            metrics: {
                totalTasks: total,
                completedTasks: completed,
                openTasks: open,
                completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
            }
        };
    });
};
