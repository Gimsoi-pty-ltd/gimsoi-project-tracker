/**
 * Task Service - Core business logic for task management.
 * @see {@link docs/DATA_CONTRACT.md} for authoritative response shapes.
 */
import prisma from "../lib/prisma.js";
import { StateTransitionError, NotFoundError, ForbiddenError } from "../utils/errors.js";
import { handlePrismaError } from "../utils/prismaErrors.js";
import ROLES from "../constants/roles.js";
import { hasPermission } from "../constants/permissions.js";
import { TASK_STATUS, SPRINT_STATUS, PROJECT_STATUS } from "../constants/statuses.js";
import { validateTaskShape, validateProjectSummaryShape } from "../utils/validateContract.js";

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
    [TASK_STATUS.TODO]: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.CANCELLED],
    [TASK_STATUS.IN_PROGRESS]: [TASK_STATUS.DONE, TASK_STATUS.CANCELLED, TASK_STATUS.BLOCKED],
    
    // Reversible — task is obstructed but not abandoned. Must return to IN_PROGRESS before completing.
    [TASK_STATUS.BLOCKED]: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.CANCELLED],
    
    // Terminal — work is finalized
    [TASK_STATUS.DONE]: [], 
    
    // Terminal — task was abandoned before completion
    [TASK_STATUS.CANCELLED]: [], 
};

const ALL_STATUSES = Object.keys(ALLOWED_TRANSITIONS);

/**
 * Role-based access is evaluated via the PERMISSIONS matrix in constants/permissions.js.
 * Do not hardcode role strings in this function.
 *
 * NOTE: Not replaced by assertOwnership — task modification requires assignee and reporter-specific property guards, and tasks do not track createdByUserId.
 * If ownership rules change, update both here and in utils/ownership.js.
 */
const canModifyTask = (existingTask, userId, userRole, updates = {}) => {
    if (!userId || !userRole) {
        return true;
    }

    // Admin and PM can modify any task globally
    if (hasPermission(userRole, 'UPDATE_ANY_TASK')) {
        return true;
    }

    // Intern can only update their own assigned task, and only status
    if (hasPermission(userRole, 'UPDATE_OWN_TASK_STATUS')) {
        const isAssignedToUser = existingTask.assigneeId === userId;
        const keysChanging = Object.keys(updates).filter(k => updates[k] !== undefined);
        const isOnlyChangingStatus =
            keysChanging.length > 0 && keysChanging.every((key) => key === 'status');

        if (isAssignedToUser && isOnlyChangingStatus) {
            return true;
        }
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
    if (task.sprint && task.sprint.status === SPRINT_STATUS.CLOSED) {
        throw new StateTransitionError("Cannot modify a task belonging to a closed sprint.");
    }
    if (task.project && task.project.status === PROJECT_STATUS.COMPLETED) {
        throw new StateTransitionError('Cannot modify a task inside a COMPLETED project.');
    }
    if (task.status === TASK_STATUS.DONE || task.status === TASK_STATUS.CANCELLED) {
        throw new StateTransitionError(`Cannot modify a task that is already ${task.status}.`);
    }
};

export const createTask = async ({ taskData, context, requestingUser }) => {
    const { title, description, priority, isBlocked, dueDate } = taskData;
    const { projectId, sprintId, reporterId, assigneeId } = context;
    const { role: userRole } = requestingUser;

    // Project-level authorization: Only roles with 'CREATE_TASK' permission can create tasks.
    if (userRole && !hasPermission(userRole, 'CREATE_TASK')) {
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
    if (project.status === PROJECT_STATUS.COMPLETED) {
        throw new StateTransitionError('Cannot create a task inside a COMPLETED project.');
    }

    if (priority && !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
        throw new StateTransitionError(`Invalid priority '${priority}'. Allowed values: LOW, MEDIUM, HIGH, URGENT`);
    }

    try {
        const task = await prisma.task.create({
            data: {
                title,
                description,
                projectId,
                sprintId,
                reporterId,
                assigneeId,
                status: TASK_STATUS.TODO,
                priority: priority || 'MEDIUM',
                isBlocked: isBlocked || false,
                dueDate: dueDate ? new Date(dueDate) : null
            }
        });
        return validateTaskShape(task);
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
        if (!status) where.status = { not: TASK_STATUS.DONE };
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

export const getTaskCountBySprintId = async (sprintId, { excludeStatus } = {}, db = prisma) => {
    const where = { sprintId: String(sprintId) };
    if (excludeStatus) {
        where.status = { not: excludeStatus };
    }
    return db.task.count({ where });
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
    return validateTaskShape(task);
};

/**
 * Guards against manually setting system-managed fields in an update payload.
 * completedAt is system-managed. Reject any payload that attempts to set it directly.
 */
const assertCompletedAtNotInPayload = (data) => {
    if ('completedAt' in data) {
        throw new Error(
            'completedAt cannot be set manually. It is set automatically on DONE transition.'
        );
    }
};

/**
 * Validates that a requested status transition is permitted by the ALLOWED_TRANSITIONS
 * state machine. Throws a StateTransitionError with verbose diagnostic codes if not.
 * All valid transitions are defined in ALLOWED_TRANSITIONS. Do not add inline transition logic here.
 */
const assertValidTransition = (currentStatus, nextStatus) => {
    if (!ALL_STATUSES.includes(nextStatus)) {
        throw new StateTransitionError(
            `Invalid task status '${nextStatus}'. Allowed values: ${ALL_STATUSES.join(', ')}`
        );
    }
    const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(nextStatus)) {
        const dataCodes = [...nextStatus].map(c => c.charCodeAt(0)).join('.');
        const allAllowedDetails = allowed.map(a => `${a} (${[...a].map(c => c.charCodeAt(0)).join('.')})`).join(' | ');
        throw new StateTransitionError(
            `Illegal task transition from ${currentStatus} to ${nextStatus} (codes: ${dataCodes}). Allowed: ${allAllowedDetails}`
        );
    }
};

/**
 * Enforces sprint-activation policy for DONE transitions.
 * Sprint must be ACTIVE to accept DONE transitions.
 * Use CANCELLED to close tasks in non-active sprints.
 */
const assertSprintIsActiveForDone = (sprint, nextStatus) => {
    if (
        nextStatus === TASK_STATUS.DONE &&
        sprint &&
        sprint.status !== SPRINT_STATUS.ACTIVE
    ) {
        throw new StateTransitionError('Cannot mark a task as DONE outside of an active sprint.');
    }
};

/**
 * Auto-sets completedAt on DONE transition only.
 */
const injectCompletedAt = (data, nextStatus) => {
    if (nextStatus === TASK_STATUS.DONE) {
        return { ...data, completedAt: new Date() };
    }
    return data;
};

export const updateTask = async (id, data, userId, userRole) => {
    assertCompletedAtNotInPayload(data);

    const existing = await prisma.task.findUnique({ 
        where: { id },
        include: { project: true, sprint: true }
    });
    if (!existing) throw new NotFoundError(`Task with id ${id} not found`);

    assertTaskIsModifiable(existing);

    if (userId && userRole && !canModifyTask(existing, userId, userRole, data)) {
        throw new ForbiddenError('You do not have permission to modify this task.');
    }

    if (data.status !== undefined && data.status !== existing.status) {
        assertValidTransition(existing.status, data.status);
        assertSprintIsActiveForDone(existing.sprint, data.status);
    }

    const finalData = injectCompletedAt(data, data.status);

    const task = await prisma.task.update({
        where: { id },
        data: {
            title:       finalData.title       !== undefined ? finalData.title             : existing.title,
            description: finalData.description !== undefined ? finalData.description       : existing.description,
            status:      finalData.status      !== undefined ? finalData.status            : existing.status,
            sprintId:    finalData.sprintId    !== undefined ? finalData.sprintId          : existing.sprintId,
            assigneeId:  finalData.assigneeId  !== undefined ? finalData.assigneeId        : existing.assigneeId,
            priority:    finalData.priority    !== undefined ? finalData.priority          : existing.priority,
            isBlocked:   finalData.isBlocked   !== undefined ? finalData.isBlocked         : existing.isBlocked,
            dueDate:     finalData.dueDate     !== undefined ? new Date(finalData.dueDate) : existing.dueDate,
            completedAt: finalData.completedAt !== undefined ? finalData.completedAt       : existing.completedAt,
        }
    });

    return validateTaskShape(task);
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

/**
 * Private helper — not exported. Called by getProjectTaskSummary and getTaskCompletionStats only.
 * Aggregates task counts by status and calculates the percentage of completed tasks.
 */
const aggregateTasksByStatus = async (projectId) => {
    const counts = await prisma.task.groupBy({
        by: ['status'],
        where: { projectId: String(projectId) },
        _count: { _all: true }
    });

    const summary = {
        [TASK_STATUS.TODO]: 0,
        [TASK_STATUS.IN_PROGRESS]: 0,
        [TASK_STATUS.DONE]: 0,
        [TASK_STATUS.CANCELLED]: 0
    };

    counts.forEach((c) => {
        if (summary[c.status] !== undefined) {
            summary[c.status] = c._count._all;
        }
    });

    summary.total = Object.values(summary).reduce((a, b) => a + b, 0);
    summary.percentComplete = summary.total 
        ? Math.round((summary[TASK_STATUS.DONE] / summary.total) * 100) 
        : 0;

    return summary;
};

export const getProjectTaskSummary = async (projectId) => {
    const summary = await aggregateTasksByStatus(projectId);
    return validateProjectSummaryShape(summary);
};

export const getTaskSummaryForProject = async (projectId) => {
    const summary = await aggregateTasksByStatus(projectId);
    return validateProjectSummaryShape(summary);
};

export const getTaskCompletionStats = async (projectId) => {
    const summary = await aggregateTasksByStatus(projectId);
    return validateProjectSummaryShape(summary);
};
