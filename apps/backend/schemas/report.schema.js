import { z } from 'zod';

export const createReportSchema = z.object({
    name: z.string().min(1, 'Report name is required'),
    type: z.string().min(1, 'Report type is required'),
    projectId: z.string().uuid().optional().nullish(),
});
