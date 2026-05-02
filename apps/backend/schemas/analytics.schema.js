import { z } from 'zod';

export const teamAnalyticsSchema = z.object({
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
    cursor: z.string().optional(),
});
