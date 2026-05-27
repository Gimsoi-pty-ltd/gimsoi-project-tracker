import { z } from 'zod';

export const teamAnalyticsSchema = z.object({
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
    cursor: z.string().optional(),
});

export const healthScoreSchema = z.object({
    projectId: z.string().uuid(),
    completionRate: z.number().min(0).max(100),
    blockedTasks: z.number().int().min(0),
});
