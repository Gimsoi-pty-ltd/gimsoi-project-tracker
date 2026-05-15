import { ForbiddenError } from "./errors.js";

/**
 * Asserts that the given user has permission to modify the given resource.
 * Throws ForbiddenError if the user is not an ADMIN and not the creator.
 * 
 * @param {Object} resource - The database entity containing createdByUserId
 * @param {string} userId - ID of the user attempting the action
 * @param {string} userRole - Role of the user attempting the action
 */
export const assertOwnership = (resource, userId, userRole) => {
    if (!resource) return; // NotFound handles this downstream

    if (userRole === 'ADMIN') {
        return true;
    }

    if (resource.createdByUserId !== userId) {
        throw new ForbiddenError("You do not have permission to modify this resource. Only the creator or an ADMIN can perform this action.");
    }

    return true;
};
