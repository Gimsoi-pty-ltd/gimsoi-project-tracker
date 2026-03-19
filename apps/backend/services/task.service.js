import prisma from "../lib/prisma.js";
import { StateTransitionError, NotFoundError, ForbiddenError } from "../utils/errors.js";
import { handlePrismaError } from "../utils/prismaErrors.js";

import { TASK_TRANSITIONS } from "../utils/stateMachines.js";

export const createTask = async ({ title, description, projectId, sprintId, reporterId, assigneeId, priority, dueDate, isBlocked, blockedReason, userRole }) => {
    // Phase 2: Security & Authorization — enforce project-level boundary constraints
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError(`Project ${projectId} not found.`);

    if (userRole !== 'ADMIN' && project.createdByUserId !== reporterId) {
        throw new ForbiddenError("Unauthorized access to project boundaries.");
    }

    // Guard: sprint must belong to the same project as the task
    if (sprintId) {
        const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
        if (!sprint) {
            throw new NotFoundError(`Sprint ${sprintId} not found.`);
        }
        if (sprint.projectId !== projectId) {
            throw new StateTransitionError("Sprint does not belong to the specified project.");
        }
    }

    if (project.status === 'COMPLETED') {
        throw new StateTransitionError('Cannot create a task inside a COMPLETED project.');
    }

    try {
        return await prisma.task.create({
            data: {
                title,
                description,
                projectId,
                sprintId,
                reporterId,
                assigneeId,
                status: 'TODO',
                priority: priority || 'MEDIUM',
                dueDate: dueDate ? new Date(dueDate) : null,
                isBlocked: isBlocked || false,
                blockedReason: blockedReason || null
            }
        });
    } catch (err) { 
        console.error("Prisma create error: ", err);
        handlePrismaError(err); 
    }
};

/**
 * @param {string} projectId
 * @param {{ limit?: number, cursor?: string, filter?: string, isBlocked?: string }} options
 * limit defaults to 50. cursor is the ID of the last record from the previous page.
 */
export const getTasksByProject = async (projectId, { limit = 50, cursor, filter, isBlocked } = {}) => {
    const where = { projectId };

    if (filter === 'overdue') {
        where.dueDate = { lt: new Date() };
        where.status = { not: 'DONE' };
    }

    if (isBlocked !== undefined) {
        where.isBlocked = isBlocked === 'true';
    }

    return prisma.task.findMany({
        where,
        take: limit,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include: {
            assignee: { select: { id: true, fullName: true, email: true } },
            reporter: { select: { id: true, fullName: true, email: true } },
            sprint: { select: { id: true, name: true, status: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const getTaskById = async (id) => {
    const task = await prisma.task.findUnique({
        where: { id },
        include: {
            assignee: { select: { id: true, fullName: true, email: true } },
            reporter: { select: { id: true, fullName: true, email: true } },
        }
    });
    if (!task) {
        throw new NotFoundError(`Task with id ${id} not found`);
    }
    return task;
};

export const updateTask = async (id, data, userId, userRole) => {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
        throw new NotFoundError(`Task with id ${id} not found`);
    }

    const project = await prisma.project.findUnique({ where: { id: existing.projectId } });
    if (!project) throw new NotFoundError(`Project ${existing.projectId} not found.`);

    if (userId && userRole) {
        // Phase 2: Project-level check
        if (userRole !== 'ADMIN' && project.createdByUserId !== userId) {
            throw new ForbiddenError("Unauthorized access to project boundaries.");
        }

        // Existing Reporter-level check
        if (userRole !== 'ADMIN' && existing.reporterId !== userId) {
            throw new ForbiddenError("Only the reporter or an ADMIN can modify this task.");
        }
    }

    if (project.status === 'COMPLETED') {
        throw new StateTransitionError('Cannot modify a task inside a COMPLETED project.');
    }

    if (existing.status === 'DONE') {
        throw new StateTransitionError('Cannot modify a task that is already DONE.');
    }

    const ALL_STATUSES = Object.keys(TASK_TRANSITIONS);

    if (data.status !== undefined && data.status !== existing.status) {
        if (!ALL_STATUSES.includes(data.status)) {
            throw new StateTransitionError(
                `Invalid task status '${data.status}'. Allowed values: ${ALL_STATUSES.join(', ')}`
            );
        }
        const allowed = TASK_TRANSITIONS[existing.status] ?? [];
        if (!allowed.includes(data.status)) {
            throw new StateTransitionError(
                `Illegal task transition from ${existing.status} to ${data.status}.`
            );
        }
    }

    return prisma.task.update({
        where: { id },
        data: {
            title: data.title !== undefined ? data.title : existing.title,
            description: data.description !== undefined ? data.description : existing.description,
            status: data.status !== undefined ? data.status : existing.status,
            sprintId: data.sprintId !== undefined ? data.sprintId : existing.sprintId,
            assigneeId: data.assigneeId !== undefined ? data.assigneeId : existing.assigneeId,
            priority: data.priority !== undefined ? data.priority : existing.priority,
            dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : existing.dueDate,
            isBlocked: data.isBlocked !== undefined ? data.isBlocked : existing.isBlocked,
            blockedReason: data.blockedReason !== undefined ? data.blockedReason : existing.blockedReason
        }
    });
};

export const deleteTask = async (id, userId, userRole) => {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
        throw new NotFoundError(`Task with id ${id} not found`);
    }

    if (userId && userRole) {
        if (userRole !== 'ADMIN' && existing.reporterId !== userId) {
            throw new ForbiddenError("Only the reporter or an ADMIN can modify this task.");
        }
    }

    await prisma.task.delete({ where: { id } });
    return true;
};

export const getProjectTaskSummary = async (projectId) => {
    const now = new Date();
    const [total, overdueCount, blockedCount, statusGroups] = await prisma.$transaction([
        prisma.task.count({ where: { projectId } }),
        prisma.task.count({
            where: {
                projectId,
                dueDate: { lt: now },
                status: { not: 'DONE' }
            }
        }),
        prisma.task.count({ where: { projectId, isBlocked: true } }),
        prisma.task.groupBy({
            by: ['status'],
            where: { projectId },
            _count: { status: true }
        })
    ]);

    const statusBreakdown = {
        TODO: 0,
        IN_PROGRESS: 0,
        DONE: 0
    };

    statusGroups.forEach(g => {
        if (g.status in statusBreakdown) {
            statusBreakdown[g.status] = g._count.status;
        }
    });

    return {
        total,
        overdueCount,
        blockedCount,
        statusBreakdown
    };
};
