import prisma from "../lib/prisma.js";
import { StateTransitionError, NotFoundError, ForbiddenError } from "../utils/errors.js";
import { handlePrismaError } from "../utils/prismaErrors.js";

export const createTask = async ({ title, description, projectId, sprintId, reporterId, assigneeId, priority }) => {
    // POLICY-PENDING: Missing authorization check — ensure the user creating the task has permission 
    // to add tasks to this project, and verify if the requesting userId must match the reporterId.

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

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError(`Project ${projectId} not found.`);
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
                priority: priority || 'MEDIUM'
            }
        });
    } catch (err) { 
        console.error("Prisma create error: ", err);
        handlePrismaError(err); 
    }
};

/**
 * @param {string} projectId
 * @param {{ limit?: number, cursor?: string }} options
 * limit defaults to 50. cursor is the ID of the last record from the previous page.
 */
export const getTasksByProject = async (projectId, { limit = 50, cursor } = {}) => {
    return prisma.task.findMany({
        where: { projectId },
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
    if (project.status === 'COMPLETED') {
        throw new StateTransitionError('Cannot modify a task inside a COMPLETED project.');
    }

    if (userId && userRole) {
        if (userRole !== 'ADMIN' && existing.reporterId !== userId) {
            throw new ForbiddenError("Only the reporter or an ADMIN can modify this task.");
        }
    }

    if (existing.status === 'DONE') {
        throw new StateTransitionError('Cannot modify a task that is already DONE.');
    }

    // Directional state machine — only permitted transitions are allowed.
    // Setting the same status is a silent no-op (data.status === existing.status).
    const TASK_TRANSITIONS = {
        TODO:        ['IN_PROGRESS'],
        IN_PROGRESS: ['DONE'],
        DONE:        [],
    };
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
