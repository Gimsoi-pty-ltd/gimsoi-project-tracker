import prisma from "../lib/prisma.js";
import { StateTransitionError, NotFoundError, ForbiddenError } from "../utils/errors.js";
import { handlePrismaError } from "../utils/prismaErrors.js";
import ROLES from "../constants/roles.js";

/**
 * ALLOWED_TRANSITIONS defines the valid state machine for task status changes.
 * 
 * Rules:
 * - Each key represents a source state (current status).
 * - Each value is an array of valid target states (next status).
 * - Empty array means the state is terminal (no further transitions allowed).
 * - This map is enforced in the updateTask service method.
 *
 * All Valid States:
 * - TODO (Initial status)
 * - IN_PROGRESS (Active work)
 * - BLOCKED (Reversible)
 * - DONE (Terminal)
 * - CANCELLED (Terminal)
 */
export const ALLOWED_TRANSITIONS = {
    TODO: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['DONE', 'CANCELLED', 'BLOCKED'],
    
    // Reversible — task is obstructed but not abandoned. Must return to IN_PROGRESS before completing.
    BLOCKED: ['IN_PROGRESS', 'CANCELLED'],
    
    // Terminal — work is finalized
    DONE: [], 
    
    // Terminal — task was abandoned before completion
    CANCELLED: [], 
};

const ALL_STATUSES = Object.keys(ALLOWED_TRANSITIONS);

/**
 * NOTE: Not replaced by assertOwnership — task modification requires assignee and reporter-specific property guards, and tasks do not track createdByUserId.
 * If ownership rules change, update both here and in utils/ownership.js.
 */
const canModifyTask = (existingTask, userId, userRole, updates = {}) => {
    if (!userId || !userRole) {
        return true;
    }

    // Admin can do anything
    if (userRole === 'ADMIN') {
        return true;
    }

    // PM can update tasks
    if (userRole === ROLES.PROJECT_MANAGER) {
        return true;
    }

    // Intern can only update their own assigned task, and only status
    if (userRole === 'INTERN') {
        const isAssignedToUser = existingTask.assigneeId === userId;
        const keysChanging = Object.keys(updates).filter(k => updates[k] !== undefined);
        const isOnlyChangingStatus =
            keysChanging.length > 0 && keysChanging.every((key) => key === 'status');

        return isAssignedToUser && isOnlyChangingStatus;
    }

    // Reporter can still modify their own task
    if (existingTask.reporterId === userId) {
        return true;
    }

    return false;
};

/**
 * Registry of general modification guards:
 * - Cannot modify a task inside a COMPLETED project.
 * - Cannot modify a task that is already DONE.
 * - Cannot modify a task that is already CANCELLED.
 * - Cannot modify a task belonging to a closed sprint.
 * NOTE: Sprint ACTIVE -> DONE guard lives in updateTask directly (transition-scoped, not general).
 */
const assertTaskIsModifiable = (task) => {
    if (task.sprint && task.sprint.status === 'CLOSED') {
        throw new StateTransitionError("Cannot modify a task belonging to a closed sprint.");
    }
    if (task.project && task.project.status === 'COMPLETED') {
        throw new StateTransitionError('Cannot modify a task inside a COMPLETED project.');
    }
    if (task.status === 'DONE' || task.status === 'CANCELLED') {
        throw new StateTransitionError(`Cannot modify a task that is already ${task.status}.`);
    }
};

export const createTask = async ({ title, description, projectId, sprintId, reporterId, assigneeId, priority, isBlocked, dueDate, userRole }) => {
    // Project-level authorization: Only ADMIN and PM can create tasks.
    if (userRole && userRole !== 'ADMIN' && userRole !== ROLES.PROJECT_MANAGER) {
        throw new ForbiddenError(`Role '${userRole}' is not authorized to create tasks.`);
    }

    // Guard: sprint must belong to the same project as the task
    if (sprintId) {
        const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
        if (!sprint) {
            throw new NotFoundError(`Sprint ${sprintId} not found.`);
        }
        if (sprint.projectId !== projectId) {
            throw new StateTransitionError("Sprint does not belong to the specified project.");
        }
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError(`Project ${projectId} not found.`);
    if (project.status === 'COMPLETED') {
        throw new StateTransitionError('Cannot create a task inside a COMPLETED project.');
    }

    if (priority && !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
        throw new StateTransitionError(`Invalid priority '${priority}'. Allowed values: LOW, MEDIUM, HIGH, URGENT`);
    }

    try {
        return await prisma.task.create({
            data: {
                title,
                description,
                projectId,
                sprintId,
                reporterId,
                assigneeId,
                status: 'TODO',
                priority: priority || 'MEDIUM',
                isBlocked: isBlocked || false,
                dueDate: dueDate ? new Date(dueDate) : null
            }
        });
    } catch (err) { 
        console.error("Prisma create error: ", err);
        handlePrismaError(err); 
    }
};

/**
 * @param {string} projectId
 * @param {{ limit?: number, cursor?: string, status?: string, isBlocked?: boolean, isOverdue?: boolean }} options
 */
export const getTasksByProject = async (projectId, { limit = 50, cursor, status, isBlocked, isOverdue } = {}) => {
    const where = { projectId };
    if (status) where.status = status;
    if (isBlocked !== undefined) where.isBlocked = isBlocked;
    if (isOverdue === true) {
        where.dueDate = { lt: new Date() };
        if (!status) where.status = { not: 'DONE' };
    }

    return prisma.task.findMany({
        where,
        take: limit + 1, // Fetch one extra to determine if there's a next page
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include: {
            assignee: { select: { id: true, fullName: true, email: true } },
            reporter: { select: { id: true, fullName: true, email: true } },
            sprint: { select: { id: true, name: true, status: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const getTaskById = async (id) => {
    const task = await prisma.task.findUnique({
        where: { id },
        include: {
            assignee: { select: { id: true, fullName: true, email: true } },
            reporter: { select: { id: true, fullName: true, email: true } },
        }
    });
    if (!task) {
        throw new NotFoundError(`Task with id ${id} not found`);
    }
    return task;
};

export const updateTask = async (id, data, userId, userRole) => {
    const existing = await prisma.task.findUnique({ 
        where: { id },
        include: { project: true, sprint: true }
    });
    if (!existing) {
        throw new NotFoundError(`Task with id ${id} not found`);
    }

    assertTaskIsModifiable(existing);

    if (userId && userRole) {
        if (!canModifyTask(existing, userId, userRole, data)) {
            throw new ForbiddenError("You do not have permission to modify this task.");
        }
    }

    // Directional state machine — only permitted transitions are allowed.
    // Setting the same status is a silent no-op (data.status === existing.status).
    // Uses the module-scope ALLOWED_TRANSITIONS and ALL_STATUSES constants.
    if (data.status !== undefined && data.status !== existing.status) {
        if (!ALL_STATUSES.includes(data.status)) {
            throw new StateTransitionError(
                `Invalid task status '${data.status}'. Allowed values: ${ALL_STATUSES.join(', ')}`
            );
        }
        const allowed = ALLOWED_TRANSITIONS[existing.status] ?? [];
        if (!allowed.includes(data.status)) {
            const dataCodes = [...data.status].map(c => c.charCodeAt(0)).join('.');
            const allAllowedDetails = allowed.map(a => `${a} (${[...a].map(c => c.charCodeAt(0)).join('.')})`).join(' | ');
            throw new StateTransitionError(
                `Illegal task transition from ${existing.status} to ${data.status} (codes: ${dataCodes}). Allowed: ${allAllowedDetails}`
            );
        }
    }
    
    // Sprint must be ACTIVE to accept DONE transitions. 
    // Use CANCELLED to close tasks in non-active sprints.
    if (data.status === 'DONE' && existing.sprint && existing.sprint.status !== 'ACTIVE') {
        throw new StateTransitionError("Cannot mark a task as DONE outside of an active sprint.");
    }

    return prisma.task.update({
        where: { id },
        data: {
            title: data.title !== undefined ? data.title : existing.title,
            description: data.description !== undefined ? data.description : existing.description,
            status: data.status !== undefined ? data.status : existing.status,
            sprintId: data.sprintId !== undefined ? data.sprintId : existing.sprintId,
            assigneeId: data.assigneeId !== undefined ? data.assigneeId : existing.assigneeId,
            priority: data.priority !== undefined ? data.priority : existing.priority,
            isBlocked: data.isBlocked !== undefined ? data.isBlocked : existing.isBlocked,
            dueDate: data.dueDate !== undefined ? new Date(data.dueDate) : existing.dueDate,
        }
    });
};

export const deleteTask = async (id, userId, userRole) => {
    const existing = await prisma.task.findUnique({ 
        where: { id },
        include: { project: true, sprint: true }
    });
    if (!existing) {
        throw new NotFoundError(`Task with id ${id} not found`);
    }

    assertTaskIsModifiable(existing);

    if (userId && userRole) {
        if (!canModifyTask(existing, userId, userRole)) {
            throw new ForbiddenError("You do not have permission to delete this task.");
        }
    }

    await prisma.task.delete({ where: { id } });
    return true;
};

export const getProjectTaskSummary = async (projectId) => {
    const counts = await prisma.task.groupBy({
        by: ['status'],
        where: { projectId },
        _count: { _all: true }
    });

    const summary = {
        TODO: 0,
        IN_PROGRESS: 0,
        DONE: 0,
        CANCELLED: 0
    };

    counts.forEach((c) => {
        if (summary[c.status] !== undefined) {
            summary[c.status] = c._count._all;
        }
    });

    return summary;
};

export const getTaskCompletionStats = async (projectId) => {
    const groups = await prisma.task.groupBy({
        by: ['status'],
        where: { projectId: String(projectId) },
        _count: { status: true },
    });

    const totals = { TODO: 0, IN_PROGRESS: 0, DONE: 0, CANCELLED: 0 };
    for (const g of groups) {
        if (g.status in totals) totals[g.status] = g._count.status;
    }

    const total = totals.TODO + totals.IN_PROGRESS + totals.DONE + totals.CANCELLED;
    return {
        ...totals,
        total,
        percentComplete: total ? Math.round((totals.DONE / total) * 100) : 0,
    };
};
