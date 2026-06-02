import prisma from '../lib/prisma.js';

/**
 * Performs a global search across projects, tasks, and users.
 * 
 * @param {string} query - The search term
 * @param {string} type - optional filter: 'all' | 'project' | 'task' | 'user'
 * @returns {object} - Grouped search results
 */
export const globalSearch = async (query, type = 'all') => {
    const searchTasks = (type === 'all' || type === 'task') ? 
        prisma.task.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: 10,
            include: { project: { select: { name: true } } }
        }) : Promise.resolve([]);

    const searchProjects = (type === 'all' || type === 'project') ?
        prisma.project.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: 10,
            include: { client: { select: { name: true } } }
        }) : Promise.resolve([]);

    const searchUsers = (type === 'all' || type === 'user') ?
        prisma.user.findMany({
            where: {
                OR: [
                    { fullName: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: 10,
            select: { id: true, fullName: true, email: true, role: true, avatarUrl: true }
        }) : Promise.resolve([]);

    const [tasks, projects, users] = await Promise.all([searchTasks, searchProjects, searchUsers]);

    return {
        tasks,
        projects,
        users
    };
};
