import prisma from '../lib/prisma.js';
import { NotFoundError } from '../utils/errors.js';
import { parsePagination } from '../utils/pagination.js';
import { handlePrismaError, handleConcurrencyError } from '../utils/prismaErrors.js';
import { assertOwnership } from '../utils/ownership.js';
import { assertProjectMembership } from '../utils/membership.js';
import ROLES from '../constants/roles.js';

/**
 * Creates a new phase for a project.
 */
export const createPhase = async ({ name, description, startDate, endDate, status, order, projectId, userId, userRole }) => {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError(`Project ${projectId} not found.`);

    // Security: Must have permission to modify the project
    assertOwnership(project, userId, userRole);
    // Membership Guard
    await assertProjectMembership(projectId, userId, userRole);

    try {
        return await prisma.phase.create({
            data: {
                name,
                description,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                status: status || 'DRAFT',
                order: order ?? 0,
                projectId,
            },
        });
    } catch (err) {
        return handlePrismaError(err);
    }
};

/**
 * Returns all phases for a given project, ordered by the order field.
 */
export const getPhasesByProject = async (projectId, query = {}, userId, userRole) => {
    const { limit, cursor } = parsePagination(query);
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError(`Project ${projectId} not found.`);

    // Security: Must have membership to view the project
    await assertProjectMembership(projectId, userId, userRole);

    return prisma.phase.findMany({
        where: { projectId },
        take: limit + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { order: 'asc' },
        include: {
            _count: { select: { tasks: true } },
        },
    });
};

/**
 * Returns a single phase by ID.
 */
export const getPhaseById = async (id, userId, userRole) => {
    const phase = await prisma.phase.findUnique({
        where: { id },
        include: {
            project: true,
            tasks: {
                select: { id: true, title: true, status: true, assigneeId: true },
            },
        },
    });
    if (!phase) throw new NotFoundError(`Phase ${id} not found.`);

    // Security: Must have membership to view the parent project
    await assertProjectMembership(phase.project.id, userId, userRole);

    return phase;
};

/**
 * Updates a phase.
 */
export const updatePhase = async (id, data, userId, userRole) => {
    const existing = await prisma.phase.findUnique({ 
        where: { id },
        include: { project: true }
    });
    if (!existing) throw new NotFoundError(`Phase ${id} not found.`);

    // Security: Must have permission to modify the parent project
    assertOwnership(existing.project, userId, userRole);
    // Membership Guard
    await assertProjectMembership(existing.projectId, userId, userRole);

    try {
        return await prisma.phase.update({
            where: { id, version: data.version },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
                ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
                ...(data.status !== undefined && { status: data.status }),
                ...(data.order !== undefined && { order: data.order }),
                version: { increment: 1 }
            },
        });
    } catch (err) {
        handleConcurrencyError(err, 'Phase');
        return handlePrismaError(err);
    }
};

/**
 * Deletes a phase by ID. Tasks with this phaseId will have phaseId set to null (SetNull).
 */
export const deletePhase = async (id, userId, userRole) => {
    const existing = await prisma.phase.findUnique({ 
        where: { id },
        include: { project: true }
    });
    if (!existing) throw new NotFoundError(`Phase ${id} not found.`);

    // Security: Must have permission to modify the parent project
    assertOwnership(existing.project, userId, userRole);
    // Membership Guard
    await assertProjectMembership(existing.projectId, userId, userRole);

    await prisma.phase.delete({ where: { id } });
    return true;
};

/**
 * Checks if all tasks in a phase are DONE and updates phase status to COMPLETED if so.
 */
export const checkPhaseCompletion = async (phaseId) => {
    const phase = await prisma.phase.findUnique({
        where: { id: phaseId },
        include: { tasks: true }
    });
    if (!phase) {
        return;
    }
    if (phase.tasks.length === 0) {
        return;
    }

    const allDone = phase.tasks.every(t => t.status === 'DONE');
    
    if (allDone && phase.status !== 'COMPLETED') {
        await prisma.phase.update({
            where: { id: phaseId },
            data: { status: 'COMPLETED' }
        });
    } else if (!allDone && phase.status === 'COMPLETED') {
        await prisma.phase.update({
            where: { id: phaseId },
            data: { status: 'ACTIVE' }
        });
    }
};

/**
 * Checks completion status for multiple phases concurrently.
 */
export const checkPhasesCompletion = async (phaseIds) => {
    if (!phaseIds || phaseIds.length === 0) return;
    await Promise.all(phaseIds.map(id => checkPhaseCompletion(id)));
};

/**
 * Milestone Tracking: Get status of all tasks in a phase.
 */
export const getMilestoneStatus = async (phaseId, userId, userRole) => {
    const today = new Date();
    const phase = await prisma.phase.findUnique({
        where: { id: phaseId },
        include: {
            project: true,
            tasks: {
                select: { status: true, isBlocked: true, dueDate: true }
            }
        }
    });
    if (!phase) throw new NotFoundError(`Phase ${phaseId} not found.`);
    await assertProjectMembership(phase.project.id, userId, userRole);

    const counts = phase.tasks.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        if (t.isBlocked) acc.blockedCount++;
        if (t.dueDate && t.dueDate < today && !['DONE', 'CANCELLED'].includes(t.status)) acc.overdueCount++;
        return acc;
    }, { 
        total: phase.tasks.length, 
        blockedCount: 0, 
        overdueCount: 0,
        TODO: 0,
        IN_PROGRESS: 0,
        BLOCKED: 0,
        DONE: 0,
        CANCELLED: 0
    });

    const percentComplete = phase.tasks.length > 0 
        ? Math.round(((counts.DONE || 0) / phase.tasks.length) * 100) 
        : 0;

    const penalty = (counts.overdueCount * 5) + (counts.blockedCount * 10);
    const healthScore = Math.max(0, percentComplete - penalty);

    return {
        phaseId: phase.id,
        phaseName: phase.name,
        status: phase.status,
        taskCounts: counts,
        percentComplete,
        healthScore
    };
};
