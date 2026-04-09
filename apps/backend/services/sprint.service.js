/** @see {@link docs/DATA_CONTRACT.md} */
import prisma from "../lib/prisma.js";
import { StateTransitionError, NotFoundError } from '../utils/errors.js';
import { assertOwnership } from "../utils/ownership.js";
import { SPRINT_STATUS, PROJECT_STATUS, TASK_STATUS } from "../constants/statuses.js";
import { getTaskCountBySprintId } from "./task.service.js";

export const createSprint = async ({ name, projectId, status, startDate, endDate, createdByUserId }) => {
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

export const closeSprint = async (id, userId, userRole, db = prisma) => {
    const sprint = await db.sprint.findUnique({ where: { id: String(id) } });

    if (!sprint) throw new NotFoundError(`Sprint ${id} not found`);

    if (userId && userRole) assertOwnership(sprint, userId, userRole);

    // Task counts are owned by the Task domain. Do not query task tables directly from this file — use the Task service.
    const openTaskCount = await getTaskCountBySprintId(id, { excludeStatus: TASK_STATUS.DONE }, db);


    if (openTaskCount > 0) {
        throw new StateTransitionError("Cannot close sprint with active open tasks remaining.");
    }

    return db.sprint.update({
        where: { id: String(id) },
        data: { status: SPRINT_STATUS.CLOSED }
    });
}


export const updateSprintStatus = async (id, targetStatus, userId, userRole, db = prisma) => {
    const sprint = await db.sprint.findUnique({ where: { id: String(id) } });

    if (!sprint) throw new NotFoundError(`Sprint ${id} not found`);

    if (userId && userRole) assertOwnership(sprint, userId, userRole);

    const currentStatus = sprint.status;

    const validTransitions = {
        [SPRINT_STATUS.PLANNING]: [SPRINT_STATUS.ACTIVE],
        [SPRINT_STATUS.ACTIVE]: [SPRINT_STATUS.CLOSED],
        [SPRINT_STATUS.CLOSED]: []
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
        throw new StateTransitionError(`Illegal sprint state transition from ${currentStatus} to ${targetStatus}`);
    }

    if (targetStatus === SPRINT_STATUS.CLOSED) {
        return closeSprint(id, userId, userRole, db); // Pass down to the specific closer method
    }

    return db.sprint.update({
        where: { id: String(id) },
        data: { status: targetStatus }
    });
}


export const updateSprint = async (id, data, userId, userRole) => {
    const sprint = await prisma.sprint.findUnique({ where: { id: String(id) } });
    if (!sprint) throw new NotFoundError(`Sprint ${id} not found`);

    if (userId && userRole) assertOwnership(sprint, userId, userRole);

    if (data.startDate !== undefined && data.startDate !== null && isNaN(Date.parse(data.startDate))) {
        throw new StateTransitionError('Invalid startDate format.');
    }
    if (data.endDate !== undefined && data.endDate !== null && isNaN(Date.parse(data.endDate))) {
        throw new StateTransitionError('Invalid endDate format.');
    }

    return prisma.sprint.update({
        where: { id: String(id) },
        data: {
            name: data.name !== undefined ? data.name : sprint.name,
            startDate: data.startDate !== undefined ? new Date(data.startDate) : sprint.startDate,
            endDate: data.endDate !== undefined ? new Date(data.endDate) : sprint.endDate,
        }
    });
};
