import prisma from '../lib/prisma.js';
import { NotFoundError } from '../utils/errors.js';
import { handlePrismaError } from '../utils/prismaErrors.js';

/**
 * Creates a new report entry in the database.
 */
export const createReport = async ({ name, type, projectId, createdByUserId }) => {
    if (projectId) {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) throw new NotFoundError(`Project ${projectId} not found.`);
    }

    try {
        return await prisma.report.create({
            data: {
                name,
                type,
                format: 'PDF',
                projectId: projectId || null,
                createdByUserId,
            },
        });
    } catch (err) {
        return handlePrismaError(err);
    }
};

/**
 * Returns a report by ID, including its associated project and task data for PDF generation.
 */
export const getReportById = async (id) => {
    const report = await prisma.report.findUnique({
        where: { id },
        include: {
            project: {
                include: {
                    tasks: {
                        select: { id: true, title: true, status: true, assigneeId: true, completedAt: true },
                    },
                },
            },
        },
    });
    if (!report) throw new NotFoundError(`Report ${id} not found.`);
    return report;
};

/**
 * Returns a paginated list of reports created by the requesting user.
 */
export const getReports = async ({ limit = 20, cursor, createdByUserId } = {}) => {
    const take = Math.min(Number(limit) || 20, 100);
    return prisma.report.findMany({
        where: { createdByUserId },
        take: take + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { createdAt: 'desc' },
        include: { project: { select: { id: true, name: true } } },
    });
};
