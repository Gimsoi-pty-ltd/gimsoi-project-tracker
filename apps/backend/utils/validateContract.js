/**
 * Runtime Contract Validation
 * 
 * These helpers ensure the backend service layer does not return data that
 * violates the contract documented in docs/DATA_CONTRACT.md.
 */

import { ContractViolationError } from './errors.js';
import { TASK_STATUS } from '../constants/statuses.js';

// Validates a single Task object against the authoritative shape.
export const validateTaskShape = (task) => {
    if (!task) return;

    const required = ['id', 'title', 'status', 'projectId', 'completedAt'];
    for (const field of required) {
        if (!(field in task)) {
            throw new ContractViolationError(`Task missing required field: ${field}`);
        }
    }

    if (task.completedAt !== null && task.status !== TASK_STATUS.DONE) {
        throw new ContractViolationError('Contract violation: completedAt is set on a non-DONE task.');
    }

    if (!Object.values(TASK_STATUS).includes(task.status)) {
        throw new ContractViolationError(`Task has invalid status: ${task.status}`);
    }

    return task;
};

// Validates the Project Summary analytics object.
export const validateProjectSummaryShape = (summary) => {
    if (!summary) return;

    const required = [
        TASK_STATUS.TODO,
        TASK_STATUS.IN_PROGRESS,
        TASK_STATUS.DONE,
        TASK_STATUS.CANCELLED,
        'total',
        'percentComplete'
    ];

    for (const field of required) {
        if (!(field in summary)) {
            throw new ContractViolationError(`Project Summary missing required field: ${field}`);
        }
    }

    if (typeof summary.percentComplete !== 'number' || summary.percentComplete < 0 || summary.percentComplete > 100) {
        throw new ContractViolationError(`Project Summary has invalid percentComplete: ${summary.percentComplete}`);
    }

    return summary;
};
