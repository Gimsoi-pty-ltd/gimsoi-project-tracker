import prisma from "../lib/prisma.js";
import { StateTransitionError, NotFoundError, ForbiddenError } from "../utils/errors.js";
import { handlePrismaError } from "../utils/prismaErrors.js";

export const createTask = async ({ title, description, projectId, sprintId, reporterId, assigneeId }) => {
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

    try {
        return await prisma.task.create({
            data: {
                title,
                description,
                projectId,
                sprintId,
                reporterId,
                assigneeId,
                status: 'TODO'
            }
        });
    } catch (err) { handlePrismaError(err); }
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
    return prisma.task.findUnique({
        where: { id },
        include: {
            assignee: { select: { id: true, fullName: true, email: true } },
            reporter: { select: { id: true, fullName: true, email: true } },
        }
    });
};

export const updateTask = async (id, data, userId, userRole) => {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
        throw new NotFoundError(`Task with id ${id} not found`);
    }

    if (userId && userRole) {
        if (userRole !== 'ADMIN' && existing.reporterId !== userId) {
            throw new ForbiddenError("Only the reporter or an ADMIN can modify this task.");
        }
    }

    // Validate status transition — reject arbitrary strings before hitting the DB
    const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
    if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
        throw new StateTransitionError(
            `Invalid task status '${data.status}'. Allowed values: ${VALID_STATUSES.join(', ')}`
        );
    }

    return prisma.task.update({
        where: { id },
        data: {
            title: data.title !== undefined ? data.title : existing.title,
            description: data.description !== undefined ? data.description : existing.description,
            status: data.status !== undefined ? data.status : existing.status,
            sprintId: data.sprintId !== undefined ? data.sprintId : existing.sprintId,
            assigneeId: data.assigneeId !== undefined ? data.assigneeId : existing.assigneeId,
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
