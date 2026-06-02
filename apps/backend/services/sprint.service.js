/** @see {@link docs/DATA_CONTRACT.md} */
import prisma from "../lib/prisma.js";
import { StateTransitionError, NotFoundError, ConflictError } from '../utils/errors.js';
import { assertOwnership } from "../utils/ownership.js";
import { assertProjectMembership } from "../utils/membership.js";
import { SPRINT_STATUS, PROJECT_STATUS, TASK_STATUS } from "../constants/statuses.js";
import { getTaskCountBySprintId } from "./task.service.js";

/**
 * Valid state transitions for a Sprint.
 * Mirrored from task.service.js pattern to allow isolated unit testing.
 */
export const SPRINT_ALLOWED_TRANSITIONS = {
    [SPRINT_STATUS.PLANNING]: [SPRINT_STATUS.ACTIVE],
    [SPRINT_STATUS.ACTIVE]: [SPRINT_STATUS.CLOSED],
    [SPRINT_STATUS.CLOSED]: []
};

export const createSprint = async ({ name, projectId, status, startDate, endDate, createdByUserId }) => {
    if (startDate !== undefined && startDate !== null && isNaN(Date.parse(startDate))) {
        throw new StateTransitionError('Invalid startDate format.');
    }
    if (endDate !== undefined && endDate !== null && isNaN(Date.parse(endDate))) {
        throw new StateTransitionError('Invalid endDate format.');
    }

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
        if (err.code === 'P2025') {
            throw new ConflictError("Sprint was modified by another user. Please refresh and try again.");
        }
        throw err;
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
        if (err.code === 'P2025') {
            throw new ConflictError("Sprint was modified by another user. Please refresh and try again.");
        }
        throw err;
    }
}


export const updateSprint = async (id, data, userId, userRole) => {
    const sprint = await prisma.sprint.findUnique({ where: { id: String(id) } });
    if (!sprint) throw new NotFoundError(`Sprint ${id} not found`);

    if (userId && userRole) {
        assertOwnership(sprint, userId, userRole);
        await assertProjectMembership(sprint.projectId, userId, userRole);
    }

    if (data.startDate !== undefined && data.startDate !== null && isNaN(Date.parse(data.startDate))) {
        throw new StateTransitionError('Invalid startDate format.');
    }
    if (data.endDate !== undefined && data.endDate !== null && isNaN(Date.parse(data.endDate))) {
        throw new StateTransitionError('Invalid endDate format.');
    }

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
                version: { increment: 1 }
            }
        });
    } catch (err) {
        if (err.code === 'P2025') {
            throw new ConflictError("Sprint was modified by another user. Please refresh and try again.");
        }
        throw err;
    }
};

/**
 * Calculates velocity for a specific sprint.
 * Velocity = total tasks with status 'DONE' in the sprint.
 */
export const getSprintVelocity = async (id) => {
    const sprint = await prisma.sprint.findUnique({ where: { id: String(id) } });
    if (!sprint) throw new NotFoundError(`Sprint ${id} not found`);

    const velocity = await getTaskCountBySprintId(id, { status: TASK_STATUS.DONE });

    return {
        sprintId: id,
        velocity
    };
};
