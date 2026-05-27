import prisma from "../lib/prisma.js";
import { StateTransitionError, NotFoundError, ForbiddenError } from "../utils/errors.js";
import { handlePrismaError } from "../utils/prismaErrors.js";
import { TASK_STATUS, SPRINT_STATUS, PROJECT_STATUS } from "../constants/statuses.js";
import { injectTimestamps } from './task-state-machine.service.js';

// State machine for task status transitions.
export const ALLOWED_TRANSITIONS = {
    [TASK_STATUS.TODO]:        [TASK_STATUS.IN_PROGRESS, TASK_STATUS.CANCELLED],
    [TASK_STATUS.IN_PROGRESS]: [TASK_STATUS.REVIEW, TASK_STATUS.DONE, TASK_STATUS.CANCELLED, TASK_STATUS.BLOCKED],
    [TASK_STATUS.REVIEW]:      [TASK_STATUS.DONE, TASK_STATUS.IN_PROGRESS, TASK_STATUS.CANCELLED],
    [TASK_STATUS.BLOCKED]:     [TASK_STATUS.IN_PROGRESS, TASK_STATUS.CANCELLED],
    [TASK_STATUS.DONE]:        [], 
    [TASK_STATUS.CANCELLED]:   [], 
};


const ALL_STATUSES = Object.keys(ALLOWED_TRANSITIONS);

const canModifyTask = (existingTask, userId, userRole, updates = {}) => {
    if (!userId || !userRole) return true;
    if (userRole === 'ADMIN' || userRole === 'PM') return true;

    if (userRole === 'INTERN') {
        const isAssignedToUser = existingTask.assigneeId === userId;
        const keysChanging = Object.keys(updates).filter(k => updates[k] !== undefined);
        const isOnlyChangingStatus = keysChanging.length > 0 && keysChanging.every((key) => key === 'status');
        return isAssignedToUser && isOnlyChangingStatus;
    }

    if (existingTask.reporterId === userId) return true;
    return false;
};

const assertTaskIsModifiable = (task) => {
    if (task.sprint && task.sprint.status === SPRINT_STATUS.CLOSED) {
        throw new StateTransitionError("Cannot modify a task belonging to a closed sprint.");
    }
    if (task.project && task.project.status === PROJECT_STATUS.COMPLETED) {
        throw new StateTransitionError('Cannot modify a task inside a COMPLETED project.');
    }
    if (task.status === TASK_STATUS.DONE || task.status === TASK_STATUS.CANCELLED) {
        throw new StateTransitionError(`Cannot modify a task that is already ${task.status}.`);
    }
};

export const createTask = async ({ title, description, projectId, sprintId, reporterId, assigneeId, priority, isBlocked, dueDate, userRole }) => {
    if (userRole && userRole !== 'ADMIN' && userRole !== 'PM') {
        throw new ForbiddenError(`Role '${userRole}' is not authorized to create tasks.`);
    }

    if (sprintId) {
        const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
        if (!sprint) throw new NotFoundError(`Sprint ${sprintId} not found.`);
        if (sprint.projectId !== projectId) throw new StateTransitionError("Sprint does not belong to the specified project.");
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError(`Project ${projectId} not found.`);
    if (project.status === 'COMPLETED') throw new StateTransitionError('Cannot create a task inside a COMPLETED project.');

    try {
        return await prisma.task.create({
            data: {
                title,
                description,
                projectId,
                sprintId,
                reporterId,
                assigneeId,
                status: TASK_STATUS.TODO,
                priority: priority || 'MEDIUM',
                isBlocked: isBlocked || false,
                dueDate: dueDate ? new Date(dueDate) : null
            }
        });
    } catch (err) { 
        handlePrismaError(err); 
    }
};

export const getTasksByProject = async (projectId, { limit = 50, cursor, status, isBlocked, isOverdue } = {}) => {
    const where = { projectId };
    if (status) where.status = status;
    if (isBlocked !== undefined) where.isBlocked = isBlocked;
    if (isOverdue === true) {
        where.dueDate = { lt: new Date() };
        if (!status) where.status = { not: TASK_STATUS.DONE };
    }

    return prisma.task.findMany({
        where,
        take: limit + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include: {
            assignee: { select: { id: true, fullName: true, email: true } },
            reporter: { select: { id: true, fullName: true, email: true } },
            sprint: { select: { id: true, name: true, status: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

// Fetch all tasks when no projectId is provided
export const getAllTasks = async ({ limit = 50, cursor, status, isBlocked, isOverdue } = {}) => {
    const where = {};
    if (status) where.status = status;
    if (isBlocked !== undefined) where.isBlocked = isBlocked;
    if (isOverdue === true) {
        where.dueDate = { lt: new Date() };
        if (!status) where.status = { not: TASK_STATUS.DONE };
    }

    return prisma.task.findMany({
        where,
        take: limit + 1,
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
    if (!task) throw new NotFoundError(`Task with id ${id} not found`);
    return task;
};

export const updateTask = async (id, data, userId, userRole) => {
    const existing = await prisma.task.findUnique({ 
        where: { id },
        include: { sprint: true, project: true }
    });
    if (!existing) throw new NotFoundError(`Task with id ${id} not found`);

    assertTaskIsModifiable(existing);

    if (userId && userRole && !canModifyTask(existing, userId, userRole, data)) {
        throw new ForbiddenError("You do not have permission to modify this task.");
    }

    if (data.status !== undefined && data.status !== existing.status) {
        const allowed = ALLOWED_TRANSITIONS[existing.status] ?? [];
        if (!allowed.includes(data.status)) {
            throw new StateTransitionError(`Illegal task transition from ${existing.status} to ${data.status}.`);
        }
    }

    let resolvedData = { ...data };
    if (data.status !== undefined && data.status !== existing.status) {
        resolvedData = injectTimestamps(resolvedData, data.status, existing);
    }

    return prisma.task.update({
        where: { id },
        data: {
            title: resolvedData.title !== undefined ? resolvedData.title : existing.title,
            description: resolvedData.description !== undefined ? resolvedData.description : existing.description,
            status: resolvedData.status !== undefined ? resolvedData.status : existing.status,
            sprintId: resolvedData.sprintId !== undefined ? resolvedData.sprintId : existing.sprintId,
            assigneeId: resolvedData.assigneeId !== undefined ? resolvedData.assigneeId : existing.assigneeId,
            priority: resolvedData.priority !== undefined ? resolvedData.priority : existing.priority,
            isBlocked: resolvedData.isBlocked !== undefined ? resolvedData.isBlocked : existing.isBlocked,
            dueDate: resolvedData.dueDate !== undefined ? new Date(resolvedData.dueDate) : existing.dueDate,
            completedAt: resolvedData.completedAt !== undefined ? resolvedData.completedAt : existing.completedAt,
        }
    });
};

export const deleteTask = async (id, userId, userRole) => {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError(`Task with id ${id} not found`);

    if (userId && userRole) {
        if (!canModifyTask(existing, userId, userRole)) {
            throw new ForbiddenError("You do not have permission to delete this task.");
        }
    }

    await prisma.task.delete({ where: { id } });
    return true;
};

export const getProjectTaskSummary = async (projectId) => {
    const counts = await prisma.task.groupBy({
        by: ['status'],
        where: { projectId },
        _count: { _all: true }
    });

    const summary = Object.fromEntries(
        Object.values(TASK_STATUS).map(s => [s, 0])
    );

    counts.forEach((c) => {
        if (summary[c.status] !== undefined) {
            summary[c.status] = c._count._all;
        }
    });

    return summary;
};

