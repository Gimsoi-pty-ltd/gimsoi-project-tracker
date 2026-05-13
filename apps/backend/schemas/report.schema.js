import { z } from 'zod';

export const createReportSchema = z.object({
    name: z.string().min(1, 'Report name is required'),
    type: z.enum(['PROJECT_PROGRESS', 'SPRINT_METRICS', 'TEAM_PERFORMANCE'], {
        errorMap: () => ({ message: "Invalid report type: expected PROJECT_PROGRESS, SPRINT_METRICS, or TEAM_PERFORMANCE" })
    }),
    projectId: z.string().uuid().optional().nullish(),
    sprintId: z.string().uuid().optional().nullish(),
});
