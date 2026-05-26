import prisma from "../lib/prisma.js";
import { TASK_STATUS } from "../constants/statuses.js";
import { validateProjectSummaryShape } from "../utils/validateContract.js";

/**
 * Aggregates task counts by status and calculates completion percentage.
 */
export const aggregateTasksByStatus = async (projectId) => {
    const counts = await prisma.task.groupBy({
        by: ['status'],
        where: { projectId: String(projectId) },
        _count: { _all: true }
    });

    const summary = {
        [TASK_STATUS.TODO]: 0,
        [TASK_STATUS.IN_PROGRESS]: 0,
        [TASK_STATUS.BLOCKED]: 0,
        [TASK_STATUS.DONE]: 0,
        [TASK_STATUS.CANCELLED]: 0
    };

    counts.forEach((c) => {
        if (summary[c.status] !== undefined) {
            summary[c.status] = c._count._all;
        }
    });

    summary.total = Object.values(summary).reduce((a, b) => a + b, 0);
    summary.percentComplete = summary.total 
        ? Math.round((summary[TASK_STATUS.DONE] / summary.total) * 100) 
        : 0;

    return summary;
};

export const getProjectTaskSummary = async (projectId) => {
    const summary = await aggregateTasksByStatus(projectId);
    return validateProjectSummaryShape(summary);
};

export const getProjectTaskSummaryBatch = async (projectIds) => {
    const counts = await prisma.task.groupBy({
        by: ['projectId', 'status'],
        where: { projectId: { in: projectIds.map(String) } },
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
            percentComplete: 0
        };
    });

    counts.forEach(c => {
        if (results[c.projectId] && results[c.projectId][c.status] !== undefined) {
            results[c.projectId][c.status] = c._count._all;
            results[c.projectId].total += c._count._all;
        }
    });

    Object.keys(results).forEach(projectId => {
        const summary = results[projectId];
        summary.percentComplete = summary.total
            ? Math.round((summary[TASK_STATUS.DONE] / summary.total) * 100)
            : 0;
        
        results[projectId] = validateProjectSummaryShape(summary);
    });

    return results;
};
