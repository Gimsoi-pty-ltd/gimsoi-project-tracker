import { z } from 'zod';

export const searchSchema = z.object({
    q: z.string().min(1, 'Search query is required'),
    type: z.enum(['all', 'project', 'task', 'user']).optional().default('all')
});
