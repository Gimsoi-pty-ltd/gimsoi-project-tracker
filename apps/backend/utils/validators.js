import { ValidationError } from './errors.js';

/**
 * Validates the priority field against allowed TaskPriority enum values.
 * @param {string} priority - The priority string to validate.
 * @throws {ValidationError} If the priority is invalid.
 */
export const validatePriority = (priority) => {
    if (priority && !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
        throw new ValidationError(`Invalid priority '${priority}'. Allowed values: LOW, MEDIUM, HIGH, URGENT`);
    }
};
