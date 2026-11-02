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
// ---- ADDED (Sprint 2, Task 1): employee capacity endpoints ----
// Same status definitions as getEmployeeWorkloads above.
import { NotFoundError } from "../utils/errors.js";
import { assertOwnership } from "../utils/ownership.js";

const OPEN_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "BLOCKED"];

// An employee is any non-client user who exists. Throws 404 otherwise.
const findEmployeeOrThrow = async (employeeId) => {
    const employee = await prisma.user.findUnique({
        where: { id: String(employeeId) },
        select: { id: true, fullName: true, jobTitle: true, role: true },
    });

    if (!employee || employee.role === "CLIENT") {
        throw new NotFoundError("Employee not found.");
    }

    return employee;
};

// Returns the Task filter for the caller: one project they may access,
// or all projects (ADMIN) / projects they created (PM).
const buildTaskScope = async ({ projectId, userId, userRole }) => {
    if (projectId) {
        const project = await prisma.project.findUnique({
            where: { id: String(projectId) },
            select: { id: true, createdByUserId: true },
        });

        if (!project) {
            throw new NotFoundError("Project not found.");
        }

        assertOwnership(project, userId, userRole);
        return { projectId: project.id };
    }

    return userRole === "ADMIN" ? {} : { project: { createdByUserId: userId } };
};

export const getEmployeeCapacityOverview = async ({ projectId, userId, userRole }) => {
    if (projectId) {
        // Checks that the project exists and that the caller may access it.
        await buildTaskScope({ projectId, userId, userRole });
    }

    return getEmployeeWorkloads({
        projectId,
        ownerIdForRaw: userRole === "ADMIN" ? undefined : userId,
    });
};

export const getEmployeeCapacity = async ({ employeeId, projectId, userId, userRole }) => {
    const employee = await findEmployeeOrThrow(employeeId);
    const scope = await buildTaskScope({ projectId, userId, userRole });

    const tasks = await prisma.task.findMany({
        where: { assigneeId: employee.id, isDeleted: false, ...scope },
        select: { status: true, storyPoints: true, dueDate: true, isBlocked: true },
    });

    const now = new Date();
    const open = tasks.filter((task) => OPEN_STATUSES.includes(task.status));

    return {
        employee,
        scope: { projectId: projectId ?? null },
        workload: {
            activeTasks: open.length,
            activeStoryPoints: open.reduce((sum, task) => sum + (task.storyPoints ?? 0), 0),
            completedTasks: tasks.filter((task) => task.status === "DONE").length,
            overdueTasks: open.filter((task) => task.dueDate && task.dueDate < now).length,
            blockedTasks: open.filter((task) => task.status === "BLOCKED" || task.isBlocked).length,
        },
    };
};

export const getEmployeeAssignedTasks = async ({
    employeeId, projectId, status, limit, cursor, userId, userRole,
}) => {
    const employee = await findEmployeeOrThrow(employeeId);
    const scope = await buildTaskScope({ projectId, userId, userRole });

    return prisma.task.findMany({
        where: {
            assigneeId: employee.id,
            isDeleted: false,
            ...(status ? { status } : {}),
            ...scope,
        },
        select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            storyPoints: true,
            dueDate: true,
            isBlocked: true,
            projectId: true,
            sprintId: true,
        },
        take: limit + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: [{ dueDate: "asc" }, { id: "asc" }],
    });
};