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

export const aiContextQuerySchema = z.object({
    projectId: z.string().uuid('projectId must be a valid UUID').optional(),
    startDate: z.coerce.date({ message: 'startDate must be a valid date' }).optional(),
    endDate: z.coerce.date({ message: 'endDate must be a valid date' }).optional(),
    cursor: z.string().uuid('cursor must be a valid UUID').optional(),
    limit: z.string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .pipe(z.number({ message: 'limit must be a valid number' })
            .int()
            .positive('limit must be a positive number')
            .max(50, 'limit must be 50 or less')),
});
