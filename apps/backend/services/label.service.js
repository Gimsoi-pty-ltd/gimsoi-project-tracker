import prisma from "../lib/prisma.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import { assertProjectMembership } from "../utils/membership.js";

/**
 * Creates a label for a project.
 */
export const createLabel = async ({ projectId, name, color, userId, userRole }) => {
    await assertProjectMembership(projectId, userId, userRole);

    return prisma.label.create({
        data: {
            name,
            color,
            projectId
        }
    });
};

/**
 * Lists all labels for a project.
 */
export const getLabelsByProject = async (projectId, userId, userRole) => {
    await assertProjectMembership(projectId, userId, userRole);

    return prisma.label.findMany({
        where: { projectId },
        orderBy: { name: 'asc' }
    });
};

/**
 * Updates a label.
 */
export const updateLabel = async (id, { name, color }, userId, userRole) => {
    const label = await prisma.label.findUnique({ where: { id } });
    if (!label) throw new NotFoundError(`Label ${id} not found.`);

    await assertProjectMembership(label.projectId, userId, userRole);

    return prisma.label.update({
        where: { id },
        data: { name, color }
    });
};

/**
 * Deletes a label.
 */
export const deleteLabel = async (id, userId, userRole) => {
    const label = await prisma.label.findUnique({ where: { id } });
    if (!label) throw new NotFoundError(`Label ${id} not found.`);

    await assertProjectMembership(label.projectId, userId, userRole);

    await prisma.label.delete({ where: { id } });
    return true;
};

/**
 * Attaches labels to a task.
 * @param {string} taskId
 * @param {string[]} labelIds
 */
export const attachLabelsToTask = async (taskId, labelIds, userId, userRole) => {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError(`Task ${taskId} not found.`);

    await assertProjectMembership(task.projectId, userId, userRole);

    // Verify all labels belong to the same project
    const labels = await prisma.label.findMany({
        where: { id: { in: labelIds }, projectId: task.projectId }
    });

    if (labels.length !== labelIds.length) {
        throw new ForbiddenError("Some labels are invalid or do not belong to this project.");
    }

    return prisma.task.update({
        where: { id: taskId },
        data: {
            labels: {
                set: labelIds.map(id => ({ id }))
            }
        },
        include: { labels: true }
    });
};
