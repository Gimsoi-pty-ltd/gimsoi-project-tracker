import prisma from '../lib/prisma.js';
import { NotFoundError } from '../utils/errors.js';
import { handlePrismaError } from '../utils/prismaErrors.js';
import { getSprintMetrics } from './sprint.service.js';
import { TASK_STATUS } from '../constants/statuses.js';

/**
 * Creates a new report entry in the database.
 */
export const createReport = async ({ name, type, projectId, sprintId, createdByUserId }) => {
    if (projectId) {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) throw new NotFoundError(`Project ${projectId} not found.`);
    }
    if (sprintId) {
        const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
        if (!sprint) throw new NotFoundError(`Sprint ${sprintId} not found.`);
    }

    try {
        return await prisma.report.create({
            data: {
                name,
                type,
                format: 'PDF',
                projectId: projectId || null,
                createdByUserId,
                // Assuming we might add sprintId to schema later or handle it via name/metadata
                // For now we persist projectId as the primary link
            },
        });
    } catch (err) {
        return handlePrismaError(err);
    }
};

/**
 * Returns a report by ID, including its associated project and task data for PDF generation.
 * Enriches the data with specific metrics based on the report type.
 */
export const getReportById = async (id) => {
    const report = await prisma.report.findUnique({
        where: { id },
        include: {
            project: {
                include: {
                    tasks: {
                        include: { 
                            assignee: { select: { id: true, fullName: true } },
                            labels: { select: { name: true, color: true } },
                            phase: { select: { name: true } }
                        }
                    },
                    members: { include: { user: { select: { id: true, fullName: true, role: true } } } }
                },
            },
        },
    });
    if (!report) throw new NotFoundError(`Report ${id} not found.`);

    // Enrichment logic
    if (report.type === 'SPRINT_METRICS' || report.type === 'PROJECT_PROGRESS') {
        const sprints = await prisma.sprint.findMany({
            where: { projectId: report.projectId },
            orderBy: { createdAt: 'desc' },
            take: 4 // Current + 3 historical
        });

        const currentSprint = sprints[0];
        if (currentSprint) {
            report.sprintMetrics = await getSprintMetrics(currentSprint.id);
            report.sprint = currentSprint;
            
            // Historical Velocity Trend
            const historicalSprints = sprints.slice(1);
            if (historicalSprints.length > 0) {
                const prevMetrics = await Promise.all(historicalSprints.map(s => getSprintMetrics(s.id)));
                const avgVelocity = prevMetrics.reduce((sum, m) => sum + m.velocity, 0) / prevMetrics.length;
                report.velocityTrend = avgVelocity > 0 
                    ? Math.round(((report.sprintMetrics.velocity - avgVelocity) / avgVelocity) * 100)
                    : 0;
                report.historicalVelocity = prevMetrics.map((m, i) => ({ 
                    name: historicalSprints[i].name, 
                    velocity: m.velocity 
                })).reverse();
            }
        }
    }

    // Red Flags (Blocked or Overdue & Urgent)
    const tasksForRedFlags = report.project?.tasks || [];
    const today = new Date();
    report.redFlags = tasksForRedFlags.reduce((acc, t) => {
        const isBlocked = t.status === 'BLOCKED';
        const isOverdueHigh = t.priority === 'HIGH' && t.dueDate && new Date(t.dueDate) < today && t.status !== TASK_STATUS.DONE;
        
        if (isBlocked || isOverdueHigh) {
            acc.push({
                title: t.title,
                status: t.status,
                assignee: t.assignee?.fullName || 'Unassigned',
                reason: isBlocked ? 'Currently Blocked' : 'Overdue High Priority'
            });
        }
        return acc;
    }, []);

    if (report.type === 'TEAM_PERFORMANCE') {
        const teamTasks = report.project.tasks;
        const assigneeStats = teamTasks.reduce((acc, t) => {
            const name = t.assignee?.fullName || 'Unassigned';
            if (!acc[name]) acc[name] = { total: 0, done: 0 };
            acc[name].total++;
            if (t.status === TASK_STATUS.DONE) acc[name].done++;
            return acc;
        }, {});
        report.teamStats = Object.entries(assigneeStats).map(([name, stats]) => ({
            name,
            ...stats,
            completionRate: stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
        }));
    }

    // Fetch Collaboration Data (Recent Activity & Comments)
    const scopeFilter = report.sprint 
        ? { task: { sprintId: report.sprint.id } } 
        : { task: { projectId: report.projectId } };

    report.recentActivity = await prisma.activityLog.findMany({
        where: scopeFilter,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { 
            user: { select: { fullName: true } },
            task: { select: { title: true } }
        }
    });

    report.recentComments = await prisma.comment.findMany({
        where: { ...scopeFilter, isDeleted: false },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { 
            user: { select: { fullName: true } },
            task: { select: { title: true } }
        }
    });

    return report;
};

/**
 * Returns a paginated list of reports created by the requesting user.
 */
export const getReports = async ({ limit = 20, cursor, createdByUserId } = {}) => {
    const take = Math.min(Number(limit) || 20, 100);
    return prisma.report.findMany({
        where: { createdByUserId },
        take: take + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { createdAt: 'desc' },
        include: { project: { select: { id: true, name: true } } },
    });
};
