import prisma from "../lib/prisma.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import ROLES from "../constants/roles.js";
import { assertProjectMembership } from "../utils/membership.js";

/**
 * Creates a comment on a task.
 */
export const createComment = async ({ taskId, userId, userRole, content }) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { projectId: true }
    });
    if (!task) throw new NotFoundError(`Task ${taskId} not found.`);

    // Security: Must be a project member to comment
    await assertProjectMembership(task.projectId, userId, userRole);

    return prisma.comment.create({
        data: {
            content,
            taskId,
            userId
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true
                }
            }
        }
    });
};

/**
 * Lists comments for a task.
 */
export const getCommentsByTask = async (taskId, userId, userRole) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { projectId: true }
    });
    if (!task) throw new NotFoundError(`Task ${taskId} not found.`);

    // Security: Must be a project member to see comments
    await assertProjectMembership(task.projectId, userId, userRole);

    return prisma.comment.findMany({
        where: { taskId, isDeleted: false },
        orderBy: { createdAt: 'asc' },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true
                }
            }
        }
    });
};

/**
 * Deletes a comment.
 * Allowed for: Owner of the comment, Admin, or PM of the project.
 */
export const deleteComment = async (id, userId, userRole) => {
    const comment = await prisma.comment.findUnique({
        where: { id },
        include: {
            task: {
                select: { projectId: true }
            }
        }
    });
    if (!comment || comment.isDeleted) throw new NotFoundError(`Comment ${id} not found.`);

    const isOwner = comment.userId === userId;
    const isAdmin = userRole === ROLES.ADMIN;
    const isPM = userRole === ROLES.PROJECT_MANAGER;

    if (!isOwner && !isAdmin && !isPM) {
        throw new ForbiddenError("You do not have permission to access this resource.");
    }

    await prisma.comment.update({
        where: { id },
        data: { isDeleted: true }
    });

    return true;
};
