import prisma from "../lib/prisma.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

export const createTask = async ({ title, description, projectId, sprintId, reporterId, assigneeId }) => {
    return prisma.task.create({
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
};

export const getTasksByProject = async (projectId) => {
    return prisma.task.findMany({
        where: { projectId },
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
