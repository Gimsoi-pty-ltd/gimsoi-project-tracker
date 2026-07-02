import { TASK_STATUS, SPRINT_STATUS } from "../constants/statuses.js";
import { StateTransitionError } from "../utils/errors.js";

/**
 * ALLOWED_TRANSITIONS defines the valid state machine for task status changes.
 */
export const ALLOWED_TRANSITIONS = {
    [TASK_STATUS.TODO]:        [TASK_STATUS.IN_PROGRESS, TASK_STATUS.CANCELLED],
    [TASK_STATUS.IN_PROGRESS]: [TASK_STATUS.REVIEW, TASK_STATUS.DONE, TASK_STATUS.CANCELLED, TASK_STATUS.BLOCKED],
    [TASK_STATUS.REVIEW]:      [TASK_STATUS.DONE, TASK_STATUS.IN_PROGRESS, TASK_STATUS.CANCELLED],
    [TASK_STATUS.BLOCKED]:     [TASK_STATUS.IN_PROGRESS, TASK_STATUS.CANCELLED],
    [TASK_STATUS.DONE]:        [TASK_STATUS.IN_PROGRESS, TASK_STATUS.REVIEW], 
    [TASK_STATUS.CANCELLED]:   [], 
};

export const ALL_STATUSES = Object.keys(ALLOWED_TRANSITIONS);

/**
 * Validates that a requested status transition is permitted.
 */
export const assertValidTransition = (currentStatus, nextStatus) => {
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
 */
export const assertSprintIsActiveForDone = (sprint, nextStatus) => {
    if (
        nextStatus === TASK_STATUS.DONE &&
        sprint &&
        sprint.status !== SPRINT_STATUS.ACTIVE
    ) {
        throw new StateTransitionError('Cannot mark a task as DONE outside of an active sprint.');
    }
};

/**
 * Auto-injects system-managed timestamps.
 */
export const injectTimestamps = (data, nextStatus, existingTask) => {
    let finalData = { ...data };
    if (nextStatus === TASK_STATUS.IN_PROGRESS && !existingTask.inProgressAt) {
        finalData.inProgressAt = new Date();
    }
    if (nextStatus === TASK_STATUS.DONE) {
        finalData.completedAt = new Date();
    }
    return finalData;
};
