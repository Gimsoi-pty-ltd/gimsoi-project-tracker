import prisma from "../lib/prisma.js";
import { StateTransitionError, NotFoundError } from '../utils/errors.js';
import { assertOwnership } from "../utils/ownership.js";

export const createSprint = async ({ name, projectId, status, createdByUserId }) => {
    // Guard: prevent creating sprints inside a COMPLETED project
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError(`Project ${projectId} not found.`);
    if (project.status === 'COMPLETED') {
        throw new StateTransitionError('Cannot create a sprint inside a COMPLETED project.');
    }

    return prisma.sprint.create({
        data: {
            name,
            projectId,
            status: status || 'PLANNING',
            createdByUserId,
        },
    });
};

/**
 * @param {{ limit?: number, cursor?: string }} options
 * limit defaults to 50, max 100. cursor is the id of the last record from the previous page.
 */
export const getSprintsByProject = async (projectId, { limit = 50, cursor } = {}) => {
    const take = Math.min(Number(limit) || 50, 100);
    return prisma.sprint.findMany({
        where: { projectId },
        take: take + 1,         // fetch one extra to detect whether there's a next page
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, status: true, projectId: true, createdAt: true, createdByUserId: true },
    });
};

export const getSprintById = async (id) => {
    return prisma.sprint.findUnique({
        where: { id: String(id) },
        // Use _count instead of include:{ tasks: true } — avoids loading an unbounded
        // task collection. Full task list comes from GET /api/tasks?sprintId= (paginated).
        include: { _count: { select: { tasks: true } } }
    });
};

export const closeSprint = async (id, userId, userRole) => {
    const sprint = await prisma.sprint.findUnique({ where: { id: String(id) } });
    if (!sprint) throw new NotFoundError(`Sprint ${id} not found`);

    if (userId && userRole) assertOwnership(sprint, userId, userRole);

    const openTaskCount = await prisma.task.count({
        where: {
            sprintId: id,
            status: { not: 'DONE' }
        }
    });

    if (openTaskCount > 0) {
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
        // POLICY-PENDING: team must decide if a CLOSED sprint can be reopened.
        // Currently permitted. Remove 'ACTIVE' here to permanently block reopening.
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
