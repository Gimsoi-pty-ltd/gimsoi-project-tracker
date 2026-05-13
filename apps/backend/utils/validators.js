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
/**
 * Validates a date string.
 * @param {string} date - The date string to validate.
 * @param {string} fieldName - The name of the field for the error message.
 * @throws {ValidationError} If the date format is invalid.
 */
export const validateDateString = (date, fieldName = 'date') => {
    if (date !== undefined && date !== null && isNaN(Date.parse(date))) {
        throw new ValidationError(`Invalid ${fieldName} format.`);
    }
};
