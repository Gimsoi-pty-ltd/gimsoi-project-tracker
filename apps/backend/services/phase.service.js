import prisma from '../lib/prisma.js';
import { NotFoundError } from '../utils/errors.js';
import { handlePrismaError } from '../utils/prismaErrors.js';
import { assertOwnership } from '../utils/ownership.js';

/**
 * Creates a new phase for a project.
 */
export const createPhase = async ({ name, description, startDate, endDate, order, projectId, userId, userRole }) => {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError(`Project ${projectId} not found.`);

    // Security: Must have permission to modify the project
    assertOwnership(project, userId, userRole);

    try {
        return await prisma.phase.create({
            data: {
                name,
                description,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
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
export const getPhasesByProject = async (projectId) => {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError(`Project ${projectId} not found.`);

    return prisma.phase.findMany({
        where: { projectId },
        orderBy: { order: 'asc' },
        include: {
            _count: { select: { tasks: true } },
        },
    });
};

/**
 * Returns a single phase by ID.
 */
export const getPhaseById = async (id) => {
    const phase = await prisma.phase.findUnique({
        where: { id },
        include: {
            tasks: {
                select: { id: true, title: true, status: true, assigneeId: true },
            },
        },
    });
    if (!phase) throw new NotFoundError(`Phase ${id} not found.`);
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

    try {
        return await prisma.phase.update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
                ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
                ...(data.order !== undefined && { order: data.order }),
            },
        });
    } catch (err) {
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

    await prisma.phase.delete({ where: { id } });
    return true;
};
