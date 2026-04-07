import { ValidationError } from './errors.js';

const ALLOWED_PRIORITIES = ['LOW' , 'MEDIUM' , 'HIGH' , 'CRITICAL'];

export const validatePriority = (priority) => {
    if (priority && !ALLOWED_PRIORITIES.includes(priority)) {
        throw new ValidationError(
            `Invalid priority '${priority}' . Allowed: ${ALLOWED_PRIORITIES.join(', ')}`
        );
    }
};
