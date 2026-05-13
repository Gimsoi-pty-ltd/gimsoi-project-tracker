/** @see {@link docs/DATA_CONTRACT.md} */
import prisma from "../lib/prisma.js";
import { StateTransitionError, NotFoundError } from '../utils/errors.js';
import { assertOwnership } from "../utils/ownership.js";
import { assertProjectMembership } from "../utils/membership.js";
import { SPRINT_STATUS, PROJECT_STATUS, TASK_STATUS } from "../constants/statuses.js";
import { validateDateString } from "../utils/validators.js";
import { getTaskCountBySprintId } from "./task.service.js";
import { handlePrismaError, handleConcurrencyError } from "../utils/prismaErrors.js";

/**
 * Valid state transitions for a Sprint.
 * Mirrored from task.service.js pattern to allow isolated unit testing.
 */
export const SPRINT_ALLOWED_TRANSITIONS = {
    [SPRINT_STATUS.PLANNING]: [SPRINT_STATUS.ACTIVE],
    [SPRINT_STATUS.ACTIVE]: [SPRINT_STATUS.CLOSED],
    [SPRINT_STATUS.CLOSED]: []
};

export const createSprint = async ({ name, projectId, status, goal, startDate, endDate, createdByUserId }) => {
    validateDateString(startDate, 'startDate');
    validateDateString(endDate, 'endDate');

    // Guard: prevent creating sprints inside a COMPLETED project
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError(`Project ${projectId} not found.`);
    if (project.status === PROJECT_STATUS.COMPLETED) {
        throw new StateTransitionError('Cannot create a sprint inside a COMPLETED project.');
    }

    return prisma.sprint.create({
        data: {
            name,
            projectId,
            status: status || SPRINT_STATUS.PLANNING,
            goal: goal || null,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            createdByUserId,
        },
    });
};

/**
 * @param {{ limit?: number, cursor?: string }} options
 * limit defaults to 50, max 100. cursor is the id of the last record from the previous page.
 */
export const getSprintsByProject = async (projectId, { limit = 50, cursor } = {}, requestingUser) => {
    if (requestingUser) {
        await assertProjectMembership(projectId, requestingUser.id, requestingUser.role);
    }
    const take = Math.min(Number(limit) || 50, 100);
    return prisma.sprint.findMany({
        where: { projectId },
        take: take + 1,         // fetch one extra to detect whether there's a next page
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, status: true, projectId: true, createdAt: true, createdByUserId: true, version: true },
    });
};


// Accepts the already-fetched sprint object to avoid a redundant DB round-trip.
// Ownership must be asserted by the caller (updateSprintStatus) before invoking this.
const closeSprint = async (sprint, version, db = prisma) => {
    // Task counts are owned by the Task domain. Do not query task tables directly from this file — use the Task service.
    const openTaskCount = await getTaskCountBySprintId(
        sprint.id,
        { excludeStatus: [TASK_STATUS.DONE, TASK_STATUS.CANCELLED] },
        db
    );

    if (openTaskCount > 0) {
        throw new StateTransitionError("Cannot close sprint with active open tasks remaining.");
    }

    try {
        return await db.sprint.update({
            where: { id: sprint.id, version },
            data: { 
                status: SPRINT_STATUS.CLOSED,
                version: { increment: 1 }
            }
        });
    } catch (err) {
        handleConcurrencyError(err, 'Sprint');
    }
}


export const updateSprintStatus = async (id, targetStatus, userId, userRole, version, db = prisma) => {
    const sprint = await db.sprint.findUnique({ where: { id: String(id) } });

    if (!sprint) throw new NotFoundError(`Sprint ${id} not found`);

    if (userId && userRole) {
        assertOwnership(sprint, userId, userRole);
        await assertProjectMembership(sprint.projectId, userId, userRole);
    }

    const currentStatus = sprint.status;

    const allowed = SPRINT_ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
        throw new StateTransitionError(`Illegal sprint state transition from ${currentStatus} to ${targetStatus}`);
    }

    if (targetStatus === SPRINT_STATUS.CLOSED) {
        return closeSprint(sprint, version, db);
    }

    try {
        return await db.sprint.update({
            where: { id: String(id), version },
            data: { 
                status: targetStatus,
                version: { increment: 1 }
            }
        });
    } catch (err) {
        handleConcurrencyError(err, 'Sprint');
    }
}


export const updateSprint = async (id, data, userId, userRole) => {
    const sprint = await prisma.sprint.findUnique({ where: { id: String(id) } });
    if (!sprint) throw new NotFoundError(`Sprint ${id} not found`);

    if (userId && userRole) {
        assertOwnership(sprint, userId, userRole);
        await assertProjectMembership(sprint.projectId, userId, userRole);
    }

    validateDateString(data.startDate, 'startDate');
    validateDateString(data.endDate, 'endDate');

    try {
        return await prisma.sprint.update({
            where: { id: String(id), version: data.version },
            data: {
                name: data.name !== undefined ? data.name : sprint.name,
                startDate: data.startDate !== undefined
                    ? (data.startDate === null ? null : new Date(data.startDate))
                    : sprint.startDate,
                endDate: data.endDate !== undefined
                    ? (data.endDate === null ? null : new Date(data.endDate))
                    : sprint.endDate,
                goal: data.goal !== undefined ? data.goal : sprint.goal,
                version: { increment: 1 }
            }
        });
    } catch (err) {
        handleConcurrencyError(err, 'Sprint');
    }
};

/**
 * Calculates velocity for a specific sprint.
 * Velocity = total story points of tasks with status 'DONE' in the sprint.
 */
export const getSprintVelocity = async (id) => {
    const sprint = await prisma.sprint.findUnique({ where: { id: String(id) } });
    if (!sprint) throw new NotFoundError(`Sprint ${id} not found`);

    const result = await prisma.task.aggregate({
        where: { sprintId: String(id), status: TASK_STATUS.DONE },
        _sum: { storyPoints: true }
    });

    return {
        sprintId: id,
        velocity: result._sum.storyPoints || 0
    };
};

/**
 * Aggregates and calculates 20 metrics for a sprint.
 */
export const getSprintMetrics = async (id) => {
    try {
        const sprint = await prisma.sprint.findUnique({ where: { id: String(id) } });
        if (!sprint) throw new NotFoundError(`Sprint ${id} not found`);

        const tasks = await prisma.task.findMany({
            where: { sprintId: String(id) }
        });

        const today = new Date();
        const PRIORITY_WEIGHTS = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const SEVERITY_WEIGHTS = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

        const metrics = tasks.reduce((acc, t) => {
            acc.total++;
            acc.kanbanCounts[t.status]++;

            if (t.status === TASK_STATUS.DONE) {
                acc.completed++;
                acc.velocity += (t.storyPoints || 0);
            } else if (t.status === TASK_STATUS.BLOCKED) {
                acc.blocked++;
                acc.severityIndex += (SEVERITY_WEIGHTS[t.severity] || 0);
            }

            if (t.status !== TASK_STATUS.DONE && t.dueDate && t.dueDate < today) {
                acc.overdue++;
                acc.impactScore += (PRIORITY_WEIGHTS[t.priority] || 0);
            }

            acc.sumEstimatedHours += (t.estimatedHours || 0);
            acc.sumActualHours += (t.actualHours || 0);

            return acc;
        }, {
            total: 0,
            completed: 0,
            blocked: 0,
            overdue: 0,
            velocity: 0,
            sumEstimatedHours: 0,
            sumActualHours: 0,
            impactScore: 0,
            severityIndex: 0,
            kanbanCounts: {
                TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0, BLOCKED: 0, CANCELLED: 0
            }
        });

        const completionRate = metrics.total > 0 ? (metrics.completed / metrics.total) * 100 : 0;
        const overdueRate = metrics.total > 0 ? (metrics.overdue / metrics.total) * 100 : 0;
        const blockedRate = metrics.total > 0 ? (metrics.blocked / metrics.total) * 100 : 0;

        return {
            sprintGoal: sprint.goal || "No goal set",
            totalTasks: metrics.total,
            completedTasks: metrics.completed,
            completionPercentage: Math.round(completionRate),
            velocity: metrics.velocity,
            kanbanCounts: metrics.kanbanCounts,
            taskProgress: metrics.sumEstimatedHours > 0 ? Math.round((metrics.sumActualHours / metrics.sumEstimatedHours) * 100) : 0,
            overdueTasks: metrics.overdue,
            overduePercentage: Math.round(overdueRate),
            impactScore: metrics.impactScore,
            blockedTasks: metrics.blocked,
            blockedPercentage: Math.round(blockedRate),
            severityIndex: metrics.severityIndex,
            sprintProgress: Math.round(completionRate),
            distribution: {
                complete: Math.round(completionRate),
                working: metrics.total > 0 ? Math.round((metrics.kanbanCounts.IN_PROGRESS / metrics.total) * 100) : 0,
                blocked: Math.round(blockedRate),
                todo: metrics.total > 0 ? Math.round((metrics.kanbanCounts.TODO / metrics.total) * 100) : 0
            },
            delayRate: metrics.completed > 0 ? Number((metrics.overdue / metrics.completed).toFixed(2)) : 0,
            deliveryRisk: metrics.total > 0 ? Number(((metrics.overdue + metrics.blocked) / metrics.total).toFixed(2)) : 0,
            sprintHealth: Math.max(0, Math.round(100 - (overdueRate * 0.6) - (blockedRate * 0.4)))
        };
    } catch (err) {
        throw handlePrismaError(err);
    }
};
