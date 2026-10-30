
import prisma from "../lib/prisma.js";

const ACTIVE_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "BLOCKED"];

const COMPLETED_STATUS = "DONE";

/**
 * Returns workload information for employees belonging to a project.
 *
 * Story points are used as a relative workload indicator.
 * This service does not assume a fixed employee capacity.
 */
export const getEmployeeWorkloads = async ({ projectId }) => {
    const members = await prisma.projectMember.findMany({
        where: {
            projectId,
            user: {
                isDeleted: false,
                role: {
                    not: "CLIENT",
                },
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

    const workloads = await Promise.all(
        members.map(async ({ user }) => {
            const tasks = await prisma.task.findMany({
                where: {
                    projectId,
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
                (task) =>
                    task.status === "BLOCKED" || task.isBlocked
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
