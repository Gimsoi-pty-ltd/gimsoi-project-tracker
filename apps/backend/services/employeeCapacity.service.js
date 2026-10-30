import prisma from "../lib/prisma.js";

const ACTIVE_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "BLOCKED"];
const COMPLETED_STATUS = "DONE";

/**
 * Returns workload information for employees across authorised projects.
 *
 * When projectId is provided, workload is limited to that project.
 * When ownerIdForRaw is provided, workload is limited to projects owned
 * by that user. When neither is provided, all projects are included.
 *
 * Story points are used as a relative workload indicator.
 * No fixed employee capacity is assumed.
 */
export const getEmployeeWorkloads = async ({
    projectId,
    ownerIdForRaw,
} = {}) => {
    const projectWhere = {
        ...(projectId ? { id: String(projectId) } : {}),
        ...(ownerIdForRaw ? { createdByUserId: ownerIdForRaw } : {}),
    };

    const projects = await prisma.project.findMany({
        where: projectWhere,
        select: {
            id: true,
        },
    });

    const projectIds = projects.map((project) => project.id);

    if (projectIds.length === 0) {
        return [];
    }

    const members = await prisma.projectMember.findMany({
        where: {
            projectId: { in: projectIds },
            user: {
                isDeleted: false,
                role: { not: "CLIENT" },
            },
        },
        select: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    jobTitle: true,
                    role: true,
                },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    // An employee may belong to several authorised projects.
    // Keep one employee entry so their workload is combined.
    const uniqueEmployees = [
        ...new Map(
            members.map(({ user }) => [user.id, user])
        ).values(),
    ];

    const workloads = await Promise.all(
        uniqueEmployees.map(async (user) => {
            const tasks = await prisma.task.findMany({
                where: {
                    projectId: { in: projectIds },
                    assigneeId: user.id,
                    isDeleted: false,
                },
                select: {
                    id: true,
                    status: true,
                    storyPoints: true,
                    dueDate: true,
                    isBlocked: true,
                },
            });

            const activeTasks = tasks.filter((task) =>
                ACTIVE_STATUSES.includes(task.status)
            );

            const completedTasks = tasks.filter(
                (task) => task.status === COMPLETED_STATUS
            );

            const now = new Date();

            const overdueTasks = activeTasks.filter(
                (task) => task.dueDate && task.dueDate < now
            );

            const blockedTasks = activeTasks.filter(
                (task) => task.status === "BLOCKED" || task.isBlocked
            );

            const activeStoryPoints = activeTasks.reduce(
                (total, task) => total + (task.storyPoints ?? 0),
                0
            );

            return {
                employee: user,
                workload: {
                    activeTasks: activeTasks.length,
                    activeStoryPoints,
                    completedTasks: completedTasks.length,
                    overdueTasks: overdueTasks.length,
                    blockedTasks: blockedTasks.length,
                },
            };
        })
    );

    return workloads.sort(
        (a, b) =>
            a.workload.activeStoryPoints - b.workload.activeStoryPoints ||
            a.workload.activeTasks - b.workload.activeTasks
    );
};
