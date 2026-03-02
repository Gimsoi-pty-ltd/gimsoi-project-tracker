import prisma from "../lib/prisma.js";
import { StateTransitionError, NotFoundError } from '../utils/errors.js';
import { assertOwnership } from "../utils/ownership.js";

export const createSprint = async ({ name, projectId, status, createdByUserId }) => {
    return prisma.sprint.create({
        data: {
            name,
            projectId,
            status: status || 'PLANNING',
            createdByUserId,
        },
    });
};

export const getSprintsByProject = async (projectId) => {
    return prisma.sprint.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" }
    });
};

export const getSprintById = async (id) => {
    return prisma.sprint.findUnique({
        where: { id: String(id) },
        include: { tasks: true }
    });
};

export const closeSprint = async (id, userId, userRole) => {
    const sprint = await prisma.sprint.findUnique({ where: { id: String(id) } });
    if (!sprint) throw new NotFoundError(`Sprint ${id} not found`);

    if (userId && userRole) assertOwnership(sprint, userId, userRole);

    const tasks = await prisma.task.findMany({ where: { sprintId: id } });
    const hasOpenTasks = tasks.some(task => task.status !== 'DONE');

    if (hasOpenTasks) {
        throw new StateTransitionError("Cannot close sprint with active open tasks remaining.");
    }

    return prisma.sprint.update({
        where: { id: String(id) },
        data: { status: 'CLOSED' }
    });
}

export const updateSprintStatus = async (id, targetStatus, userId, userRole) => {
    const sprint = await prisma.sprint.findUnique({ where: { id: String(id) } });
    if (!sprint) throw new NotFoundError(`Sprint ${id} not found`);

    if (userId && userRole) assertOwnership(sprint, userId, userRole);

    const currentStatus = sprint.status;

    const validTransitions = {
        'PLANNING': ['ACTIVE'],
        'ACTIVE': ['CLOSED'],
        'CLOSED': ['ACTIVE']
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
        throw new StateTransitionError(`Illegal sprint state transition from ${currentStatus} to ${targetStatus}`);
    }

    if (targetStatus === 'CLOSED') {
        return closeSprint(id, userId, userRole); // Pass down to the specific closer method
    }

    return prisma.sprint.update({
        where: { id: String(id) },
        data: { status: targetStatus }
    });
}
