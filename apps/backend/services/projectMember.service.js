import prisma from "../lib/prisma.js";
import { NotFoundError, ConflictError } from "../utils/errors.js";
import { handlePrismaError } from "../utils/prismaErrors.js";

/**
 * Adds a user to a project.
 */
export const addMember = async ({ projectId, userId, role }) => {
    try {
        return await prisma.projectMember.create({
            data: {
                projectId,
                userId,
                role: role || 'MEMBER'
            }
        });
    } catch (err) {
        if (err.code === 'P2002') {
            throw new ConflictError("User is already a member of this project.");
        }
        throw handlePrismaError(err);
    }
};

/**
 * Lists all members of a project with user details.
 */
export const getMembersByProject = async (projectId) => {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError(`Project ${projectId} not found.`);

    return prisma.projectMember.findMany({
        where: { projectId },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    avatarUrl: true,
                    role: true
                }
            }
        },
        orderBy: { createdAt: 'asc' }
    });
};

/**
 * Updates a member's role.
 */
export const updateMemberRole = async ({ projectId, userId, role }) => {
    try {
        return await prisma.projectMember.update({
            where: {
                projectId_userId: {
                    projectId,
                    userId
                }
            },
            data: { role }
        });
    } catch (err) {
        if (err.code === 'P2025') {
            throw new NotFoundError("Membership record not found.");
        }
        throw handlePrismaError(err);
    }
};

/**
 * Removes a member from a project.
 */
export const removeMember = async ({ projectId, userId }) => {
    try {
        await prisma.projectMember.delete({
            where: {
                projectId_userId: {
                    projectId,
                    userId
                }
            }
        });
        return true;
    } catch (err) {
        if (err.code === 'P2025') {
            throw new NotFoundError("Membership record not found.");
        }
        throw handlePrismaError(err);
    }
};
