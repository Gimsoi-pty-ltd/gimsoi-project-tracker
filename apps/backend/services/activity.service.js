import prisma from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";

/**
 * Logs a task activity.
 */
export const logActivity = async ({ taskId, userId, action, oldValue, newValue }, tx = prisma) => {
    return tx.activityLog.create({
        data: {
            taskId,
            userId,
            action,
            oldValue: oldValue ? JSON.stringify(oldValue) : null,
            newValue: newValue ? JSON.stringify(newValue) : null
        }
    });
};

/**
 * Retrieves activity logs for a task.
 */
export const getTaskActivities = async (taskId) => {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError(`Task ${taskId} not found.`);

    return prisma.activityLog.findMany({
        where: { taskId },
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    avatarUrl: true
                }
            }
        }
    });
};
