import prisma from '../lib/prisma.js';
import { TASK_STATUS } from '../constants/statuses.js';

/**
 * Calculates aggregated team performance metrics with pagination.
 * 
 * @param {object} options - Pagination options { limit, cursor }
 * @returns {Array} - List of users with their task counts and completion rates
 */
export const getTeamPerformance = async ({ limit = 20, cursor } = {}) => {
    const take = Math.min(Number(limit) || 20, 100);

    // Get paginated users with their assigned tasks
    const users = await prisma.user.findMany({
        take: take + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: 'asc' },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            avatarUrl: true,
            assignedTasks: {
                select: {
                    status: true
                }
            }
        }
    });

    return users.map(user => {
        const total = user.assignedTasks.length;
        const completed = user.assignedTasks.filter(t => t.status === TASK_STATUS.DONE).length;
        const open = user.assignedTasks.filter(t => [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.BLOCKED].includes(t.status)).length;
        
        return {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
            metrics: {
                totalTasks: total,
                completedTasks: completed,
                openTasks: open,
                completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
            }
        };
    });
};
