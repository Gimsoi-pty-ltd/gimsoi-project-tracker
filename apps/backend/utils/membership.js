import prisma from "../lib/prisma.js";
import ROLES from "../constants/roles.js";
import { ForbiddenError } from "./errors.js";

/**
 * Asserts that the given user is a member of the project.
 * Throws ForbiddenError if the user is not a member and is not an ADMIN or PM.
 * 
 * @param {string} projectId - ID of the project to check
 * @param {string} userId - ID of the user attempting the action
 * @param {string} userRole - Role of the user attempting the action
 * @returns {Promise<Object>} The membership record if found and valid
 */
export const assertProjectMembership = async (projectId, userId, userRole) => {
    // Global bypass for ADMIN and PROJECT_MANAGER
    if (userRole === ROLES.ADMIN || userRole === ROLES.PROJECT_MANAGER) {
        return { role: 'OWNER' }; // Return a mock-like object that signifies higher power
    }

    const membership = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId
            }
        }
    });

    if (!membership) {
        throw new ForbiddenError("You do not have permission to access this resource.");
    }

    return membership;
};

/**
 * Checks if a user is a member of a project without role bypass.
 * Used for assignee validation.
 * 
 * @param {string} projectId 
 * @param {string} userId 
 */
export const requireProjectMembership = async (projectId, userId) => {
    const membership = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId
            }
        }
    });

    if (!membership) {
        throw new ForbiddenError("You do not have permission to access this resource.");
    }

    return membership;
};
