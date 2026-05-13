// Task Service - Core business logic
import prisma from "../lib/prisma.js";
import { StateTransitionError, NotFoundError, ForbiddenError } from "../utils/errors.js";
import { handlePrismaError, handleConcurrencyError } from "../utils/prismaErrors.js";
import ROLES from "../constants/roles.js";
import { hasPermission } from "../constants/permissions.js";
import { TASK_STATUS, SPRINT_STATUS, PROJECT_STATUS } from "../constants/statuses.js";
import { validateTaskShape, validateProjectSummaryShape } from "../utils/validateContract.js";
import { validatePriority } from "../utils/validators.js";
import { assertProjectMembership, requireProjectMembership } from "../utils/membership.js";
import { logActivity } from "./activity.service.js";
import * as phaseService from "./phase.service.js";

// State machine for task status transitions. Empty array = terminal state.
export const ALLOWED_TRANSITIONS = {
    [TASK_STATUS.TODO]: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.CANCELLED],
    [TASK_STATUS.IN_PROGRESS]: [TASK_STATUS.REVIEW, TASK_STATUS.DONE, TASK_STATUS.CANCELLED, TASK_STATUS.BLOCKED],
    [TASK_STATUS.REVIEW]: [TASK_STATUS.DONE, TASK_STATUS.IN_PROGRESS, TASK_STATUS.CANCELLED, TASK_STATUS.BLOCKED],
    
    // Reversible — task is obstructed but not abandoned. Must return to IN_PROGRESS before completing.
    [TASK_STATUS.BLOCKED]: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.CANCELLED],
    
    // Terminal — work is finalized
    [TASK_STATUS.DONE]: [], 
    
    // Terminal — task was abandoned before completion
    [TASK_STATUS.CANCELLED]: [], 
};

const ALL_STATUSES = Object.keys(ALLOWED_TRANSITIONS);

// Evaluates role-based task modification access.
const canModifyTask = (existingTask, userId, userRole, updates = {}) => {
    if (!userId || !userRole) {
        if (process.env.NODE_ENV === 'test') return true;
        // In production, missing user context should immediately reject
        throw new ForbiddenError("Modification failed: User context is required.");
    }

    // Admin and PM can modify any task globally
    if (hasPermission(userRole, 'UPDATE_ANY_TASK')) {
        return true;
    }

    // Intern can only update their own assigned task, and only status
    if (hasPermission(userRole, 'UPDATE_OWN_TASK_STATUS')) {
        const isAssignedToUser = existingTask.assigneeId === userId;
        const keysChanging = Object.keys(updates).filter(k => k !== 'version' && updates[k] !== undefined);
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
 * Centrally logs changes to a task.
 */
export const logTaskChanges = async (taskId, userId, existing, updates, tx = prisma) => {
    if (!userId) return;

    // 1. Status Change
    if (updates.status !== undefined && updates.status !== existing.status) {
        await logActivity({ taskId, userId, action: "STATUS_CHANGE", oldValue: existing.status, newValue: updates.status }, tx);
    }

    // 2. Assignee Change
    if (updates.assigneeId !== undefined && updates.assigneeId !== existing.assigneeId) {
        await logActivity({ taskId, userId, action: "ASSIGNED", oldValue: existing.assigneeId, newValue: updates.assigneeId }, tx);
    }

    // 3. Priority Change
    if (updates.priority !== undefined && updates.priority !== existing.priority) {
        await logActivity({ taskId, userId, action: "PRIORITY_CHANGE", oldValue: existing.priority, newValue: updates.priority }, tx);
    }

    // 4. General updates
    const otherFields = ['title', 'description', 'dueDate', 'isBlocked', 'sprintId', 'phaseId'];
    const changedFields = otherFields.filter(f => updates[f] !== undefined && String(updates[f]) !== String(existing[f]));
    
    if (changedFields.length > 0) {
        await logActivity({
            taskId,
            userId,
            action: "UPDATED",
            newValue: changedFields.reduce((acc, f) => ({ ...acc, [f]: updates[f] }), {})
        }, tx);
    }
};

// Guards against modifying tasks in closed sprints, completed projects, or terminal states.
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
    const { title, description, priority, severity, storyPoints, estimatedHours, actualHours, isBlocked, dueDate } = taskData;
    const { projectId, sprintId, phaseId, reporterId, assigneeId } = context;
    const { role: userRole } = requestingUser;

    if (dueDate !== undefined && dueDate !== null && isNaN(Date.parse(dueDate))) {
        throw new StateTransitionError('Invalid dueDate format.');
    }

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

    // Guard: phase must belong to the same project as the task
    if (phaseId) {
        const phase = await prisma.phase.findUnique({ where: { id: phaseId } });
        if (!phase) {
            throw new NotFoundError(`Phase ${phaseId} not found.`);
        }
        if (phase.projectId !== projectId) {
            throw new StateTransitionError("Phase does not belong to the specified project.");
        }
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError(`Project ${projectId} not found.`);
    if (project.status === PROJECT_STATUS.COMPLETED) {
        throw new StateTransitionError('Cannot create a task inside a COMPLETED project.');
    }

    // Membership Guard: Requester must be a member (or ADMIN/PM)
    if (requestingUser) {
        await assertProjectMembership(projectId, requestingUser.id, requestingUser.role);
    }

    // Assignee Guard: If provided, assignee MUST be a member
    if (assigneeId) {
        await requireProjectMembership(projectId, assigneeId);
    }

    validatePriority(priority);

    try {
        const task = await prisma.task.create({
            data: {
                title,
                description,
                projectId,
                sprintId,
                phaseId,
                reporterId,
                assigneeId,
                status: TASK_STATUS.TODO,
                priority: priority || 'MEDIUM',
                severity: severity || 'MEDIUM',
                storyPoints: storyPoints || 0,
                estimatedHours: estimatedHours || null,
                actualHours: actualHours || null,
                isBlocked: isBlocked || false,
                dueDate: dueDate ? new Date(dueDate) : null
            }
        });

        // Wave 4: Trigger phase completion check if phaseId is provided
        if (phaseId) {
            await phaseService.checkPhaseCompletion(phaseId);
        }

        // Log Activity: Created
        if (requestingUser) {
            await logActivity({
                taskId: task.id,
                userId: requestingUser.id,
                action: "CREATED",
                newValue: { title, status: TASK_STATUS.TODO }
            });
        }

        return validateTaskShape(task);
    } catch (err) { 
        throw handlePrismaError(err);
    }
};

/**
 * @param {string} projectId
 * @param {Object} requestingUser
 * @param {{ limit?: number, cursor?: string, status?: string, isBlocked?: boolean, isOverdue?: boolean, sortBy?: string }} options
 */
export const getTasksByProject = async (projectId, requestingUser, { limit = 50, cursor, status, isBlocked, isOverdue, sortBy } = {}) => {
    if (!projectId && (!requestingUser || ![ROLES.ADMIN, ROLES.PROJECT_MANAGER].includes(requestingUser.role))) {
        throw new ForbiddenError('projectId is required for non-ADMIN/PM roles.');
    }

    const where = projectId ? { projectId } : {};

    // Row-level security: non-admins on global fetch see only their assigned tasks
    if (!projectId && requestingUser && ![ROLES.ADMIN, ROLES.PROJECT_MANAGER].includes(requestingUser.role)) {
        where.assigneeId = requestingUser.id;
    }

    // Membership Guard: If projectId is provided, non-ADMIN/PM must be a member
    if (projectId && requestingUser && ![ROLES.ADMIN, ROLES.PROJECT_MANAGER].includes(requestingUser.role)) {
        await assertProjectMembership(projectId, requestingUser.id, requestingUser.role);
    }

    if (status) where.status = status;
    if (isBlocked !== undefined) where.isBlocked = isBlocked;
    if (isOverdue === true) {
        where.dueDate = { lt: new Date() };
        if (!status) where.status = { not: TASK_STATUS.DONE };
    }

    const include = {
        assignee: { select: { id: true, fullName: true, email: true } },
        reporter: { select: { id: true, fullName: true, email: true } },
        sprint: { select: { id: true, name: true, status: true } },
        labels: true
    };

    if (sortBy === 'urgency') {
        include.phase = { select: { id: true, status: true } };
    }

    const tasks = await prisma.task.findMany({
        where,
        take: limit + 1, // Fetch one extra to determine if there's a next page
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include,
        orderBy: sortBy === 'urgency' ? undefined : { createdAt: 'desc' }
    });

    if (sortBy === 'urgency') {
        const today = new Date();
        const PRIORITY_WEIGHTS = {
            URGENT: 4,
            HIGH: 3,
            MEDIUM: 2,
            LOW: 1
        };

        tasks.forEach(task => {
            let daysOverdue = 0;
            if (task.dueDate && task.dueDate < today && ![TASK_STATUS.DONE, TASK_STATUS.CANCELLED].includes(task.status)) {
                daysOverdue = Math.floor((today - task.dueDate) / 86400000);
            }

            let phaseMultiplier = 1.0;
            if (task.isBlocked) {
                phaseMultiplier = 2.0;
            } else if (daysOverdue > 0) {
                phaseMultiplier = 1.5;
            }

            const priorityWeight = PRIORITY_WEIGHTS[task.priority] || 2;
            task.urgencyScore = priorityWeight * (daysOverdue + 1) * phaseMultiplier;
        });

        return tasks.sort((a, b) => b.urgencyScore - a.urgencyScore);
    }

    return tasks;
};

export const getTaskCountBySprintId = async (sprintId, { excludeStatus, status } = {}, db = prisma) => {
    const where = { sprintId: String(sprintId) };
    if (status) {
        where.status = status;
    } else if (excludeStatus) {
        where.status = Array.isArray(excludeStatus)
            ? { notIn: excludeStatus }
            : { not: excludeStatus };
    }
    return db.task.count({ where });
};

export const getTaskById = async (id) => {
    const task = await prisma.task.findUnique({
        where: { id },
        include: {
            assignee: { select: { id: true, fullName: true, email: true } },
            reporter: { select: { id: true, fullName: true, email: true } },
            sprint: { select: { id: true, name: true, status: true } },
            labels: true
        }
    });
    if (!task) {
        throw new NotFoundError(`Task with id ${id} not found`);
    }
    return validateTaskShape(task);
};

// Guards against manually setting system-managed completedAt field.
const assertCompletedAtNotInPayload = (data) => {
    if ('completedAt' in data) {
        throw new Error(
            'completedAt cannot be set manually. It is set automatically on DONE transition.'
        );
    }
};

// Validates status transitions against ALLOWED_TRANSITIONS.
const assertValidTransition = (currentStatus, nextStatus) => {
    if (!ALL_STATUSES.includes(nextStatus)) {
        throw new StateTransitionError(
            `Invalid task status '${nextStatus}'. Allowed values: ${ALL_STATUSES.join(', ')}`
        );
    }
    const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(nextStatus)) {
        throw new StateTransitionError(
            `Illegal task transition from ${currentStatus} to ${nextStatus}. Allowed: ${allowed.join(' | ')}`
        );
    }
};

// Ensures tasks can only be marked DONE in an ACTIVE sprint.
const assertSprintIsActiveForDone = (sprint, nextStatus) => {
    if (
        nextStatus === TASK_STATUS.DONE &&
        sprint &&
        sprint.status !== SPRINT_STATUS.ACTIVE
    ) {
        throw new StateTransitionError('Cannot mark a task as DONE outside of an active sprint.');
    }
};

// Auto-injects completedAt on DONE transition.
const injectCompletedAt = (data, nextStatus) => {
    if (nextStatus === TASK_STATUS.DONE) {
        return { ...data, completedAt: new Date() };
    }
    // If transitioning away from DONE (not currently possible via modifiable guard, but for safety),
    // we would handle nulling it here.
    return data;
};

export const updateTask = async (id, data, userId, userRole) => {
    assertCompletedAtNotInPayload(data);
    if (data.priority !== undefined) validatePriority(data.priority);

    if (data.dueDate !== undefined && data.dueDate !== null && isNaN(Date.parse(data.dueDate))) {
        throw new StateTransitionError('Invalid dueDate format.');
    }

    const existing = await prisma.task.findUnique({ 
        where: { id },
        include: { project: true, sprint: true }
    });
    if (!existing) throw new NotFoundError(`Task with id ${id} not found`);

    assertTaskIsModifiable(existing);

    if (userId && userRole && !canModifyTask(existing, userId, userRole, data)) {
        throw new ForbiddenError('You do not have permission to access this resource.');
    }

    if (data.status !== undefined && data.status !== existing.status) {
        assertValidTransition(existing.status, data.status);
        assertSprintIsActiveForDone(existing.sprint, data.status);
    }

    const finalData = injectCompletedAt(data, data.status);
    const { version, ...updatePayload } = finalData;

    try {
        const updateData = Object.entries(updatePayload).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = (key === 'dueDate' && value !== null) ? new Date(value) : value;
            }
            return acc;
        }, { version: { increment: 1 } });

        if (updatePayload.status !== undefined && updatePayload.status !== TASK_STATUS.DONE) {
            updateData.completedAt = null;
        }

        const updated = await prisma.task.update({
            where: { id, version },
            data: updateData
        });

        // Log Activity: Detect changes and log
        await logTaskChanges(id, userId, existing, updatePayload);

        // Wave 4: Trigger phase completion check
        if (updatePayload.status !== undefined && existing.phaseId) {
            await phaseService.checkPhaseCompletion(existing.phaseId);
        }

        return validateTaskShape(updated);
    } catch (err) {
        handleConcurrencyError(err, 'Task');
    }
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
        const hasGlobalDelete = hasPermission(userRole, 'DELETE_TASK');
        const hasOwnDelete = hasPermission(userRole, 'DELETE_OWN_TASK');
        const isReporter = existing.reporterId === userId;

        if (!hasGlobalDelete && !(hasOwnDelete && isReporter)) {
            throw new ForbiddenError("You do not have permission to access this resource.");
        }
    }

    await prisma.task.delete({ where: { id } });
    return true;
};


export const getProjectTaskSummary = async (projectId) => {
    const project = await prisma.project.findUnique({ where: { id: String(projectId) } });
    if (!project) throw new NotFoundError(`Project ${projectId} not found`);
    const summaries = await getProjectTaskSummaryBatch([projectId]);
    return summaries[projectId];
};

export const getProjectTaskSummaryBatch = async (projectIds) => {
    const today = new Date();
    const ids = projectIds.map(String);

    const counts = await prisma.task.groupBy({
        by: ['projectId', 'status'],
        where: { projectId: { in: ids } },
        _count: { _all: true }
    });

    const blockedCounts = await prisma.task.groupBy({
        by: ['projectId'],
        where: { projectId: { in: ids }, isBlocked: true },
        _count: { _all: true }
    });

    const overdueCounts = await prisma.task.groupBy({
        by: ['projectId'],
        where: {
            projectId: { in: ids },
            status: { notIn: [TASK_STATUS.DONE, TASK_STATUS.CANCELLED] },
            dueDate: { lt: today }
        },
        _count: { _all: true }
    });

    const results = {};
    projectIds.forEach(id => {
        results[id] = {
            [TASK_STATUS.TODO]: 0,
            [TASK_STATUS.IN_PROGRESS]: 0,
            [TASK_STATUS.BLOCKED]: 0,
            [TASK_STATUS.DONE]: 0,
            [TASK_STATUS.CANCELLED]: 0,
            total: 0,
            percentComplete: 0,
            blockedCount: 0,
            overdueCount: 0,
            healthScore: 0
        };
    });

    counts.forEach(c => {
        if (results[c.projectId] && results[c.projectId][c.status] !== undefined) {
            results[c.projectId][c.status] = c._count._all;
            results[c.projectId].total += c._count._all;
        }
    });

    blockedCounts.forEach(c => {
        if (results[c.projectId]) results[c.projectId].blockedCount = c._count._all;
    });

    overdueCounts.forEach(c => {
        if (results[c.projectId]) results[c.projectId].overdueCount = c._count._all;
    });

    Object.keys(results).forEach(projectId => {
        const summary = results[projectId];
        summary.percentComplete = summary.total
            ? Math.round((summary[TASK_STATUS.DONE] / summary.total) * 100)
            : 0;
        
        const baseScore = summary.percentComplete;
        const penalty = (summary.overdueCount * 5) + (summary.blockedCount * 10);
        summary.healthScore = Math.max(0, baseScore - penalty);

        // Ensure returning shape matches contract
        results[projectId] = validateProjectSummaryShape(summary);
    });

    return results;
};

/**
 * Bulk updates a list of tasks.
 * Validates project membership, ensures all tasks belong to the specified project,
 * verifies state transition legality, and handles optimistic locking conflicts.
 * 
 * @param {string} projectId - Project ID to scope the update
 * @param {Array<{id: string, version: number}>} tasks - Tasks to update, requiring version for optimistic locking
 * @param {Object} updateData - Shared fields to update across all specified tasks
 * @param {string} userId - ID of the user requesting the change
 * @param {string} userRole - Role of the user requesting the change
 * @returns {Promise<{success: boolean, count: number}>}
 */
export const bulkUpdateTasks = async (projectId, tasks, updateData, userId, userRole) => {
    // 1. Validate project membership
    if (userId && userRole) {
        await assertProjectMembership(projectId, userId, userRole);
    }

    const taskIds = tasks.map(t => t.id);

    // 2. Fetch all existing tasks to ensure they exist, belong to projectId, and are modifiable.
    const existingTasks = await prisma.task.findMany({
        where: { id: { in: taskIds } },
        include: { project: true, sprint: true }
    });

    if (existingTasks.length !== taskIds.length) {
        throw new NotFoundError("One or more tasks not found.");
    }

    // 3. Validation on each task
    const versionMap = new Map(tasks.map(t => [t.id, t.version]));
    
    for (const existing of existingTasks) {
        if (existing.projectId !== projectId) {
            throw new StateTransitionError(`Task ${existing.id} does not belong to project ${projectId}.`);
        }
        
        assertTaskIsModifiable(existing);

        if (updateData.status !== undefined && updateData.status !== existing.status) {
            assertValidTransition(existing.status, updateData.status);
            assertSprintIsActiveForDone(existing.sprint, updateData.status);
        }
    }

    // Guard: Sprint belongs to the project
    if (updateData.sprintId) {
        const sprint = await prisma.sprint.findUnique({ where: { id: updateData.sprintId } });
        if (!sprint || sprint.projectId !== projectId) {
            throw new StateTransitionError("Sprint does not belong to the specified project.");
        }
    }

    // Guard: Phase belongs to the project
    if (updateData.phaseId) {
        const phase = await prisma.phase.findUnique({ where: { id: updateData.phaseId } });
        if (!phase || phase.projectId !== projectId) {
            throw new StateTransitionError("Phase does not belong to the specified project.");
        }
    }

    // Guard: Assignee is a project member
    if (updateData.assigneeId) {
        await requireProjectMembership(projectId, updateData.assigneeId);
    }

    // Priority validation
    if (updateData.priority !== undefined) validatePriority(updateData.priority);

    const affectedPhaseIds = new Set();
    existingTasks.forEach(t => {
        if (t.phaseId) affectedPhaseIds.add(t.phaseId);
    });
    if (updateData.phaseId) affectedPhaseIds.add(updateData.phaseId);

    try {
        await prisma.$transaction(async (tx) => {
            for (const existing of existingTasks) {
                const updatedFields = Object.entries(updateData).reduce((acc, [key, value]) => {
                    if (value !== undefined) {
                        acc[key] = (key === 'dueDate' && value !== null) ? new Date(value) : value;
                    }
                    return acc;
                }, { version: { increment: 1 } });

                if (updateData.status !== undefined && updateData.status !== TASK_STATUS.DONE) {
                    updatedFields.completedAt = null;
                }

                await tx.task.update({
                    where: { id: existing.id, version: versionMap.get(existing.id) },
                    data: updatedFields
                });

                await logTaskChanges(existing.id, userId, existing, updateData, tx);
            }
        });
        
        if (updateData.status !== undefined || updateData.phaseId !== undefined) {
            const validPhaseIds = Array.from(affectedPhaseIds).filter(Boolean);
            await phaseService.checkPhasesCompletion(validPhaseIds);
        }
        
        return { success: true, count: taskIds.length };
    } catch (err) {
        handleConcurrencyError(err, 'One or more tasks');
    }
};

/**
 * Bulk deletes tasks.
 * @param {string} projectId 
 * @param {Array<{id: string, version: number}>} tasks 
 */
export const bulkDeleteTasks = async (projectId, tasks, userId, userRole) => {
    if (userId && userRole) {
        await assertProjectMembership(projectId, userId, userRole);
    }

    const taskIds = tasks.map(t => t.id);

    const existingTasks = await prisma.task.findMany({
        where: { id: { in: taskIds } },
        include: { project: true }
    });

    if (existingTasks.length !== taskIds.length) {
        throw new NotFoundError("One or more tasks not found.");
    }

    const versionMap = new Map(tasks.map(t => [t.id, t.version]));
    let hasGlobalDelete = false;
    let hasOwnDelete = false;
    
    if (userRole) {
        hasGlobalDelete = hasPermission(userRole, 'DELETE_TASK');
        hasOwnDelete = hasPermission(userRole, 'DELETE_OWN_TASK');
    }

    for (const existing of existingTasks) {
        if (existing.projectId !== projectId) {
            throw new StateTransitionError(`Task ${existing.id} does not belong to project ${projectId}.`);
        }
        
        assertTaskIsModifiable(existing);

        const isReporter = existing.reporterId === userId;
        if (!hasGlobalDelete && !(hasOwnDelete && isReporter)) {
            throw new ForbiddenError("You do not have permission to access this resource.");
        }
    }

    try {
        await prisma.$transaction(async (tx) => {
            for (const existing of existingTasks) {
                await tx.task.delete({
                    where: { id: existing.id, version: versionMap.get(existing.id) }
                });
            }
        });

        // Phase auto-completion check for any phases these tasks belonged to
        const affectedPhaseIds = new Set();
        existingTasks.forEach(t => {
            if (t.phaseId) affectedPhaseIds.add(t.phaseId);
        });
        
        const validPhaseIds = Array.from(affectedPhaseIds).filter(Boolean);
        await phaseService.checkPhasesCompletion(validPhaseIds);

        return { success: true, count: taskIds.length };
    } catch (err) {
        handleConcurrencyError(err, 'One or more tasks');
    }
};

