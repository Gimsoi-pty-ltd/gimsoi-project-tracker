import { z } from 'zod';

export const createActivitySchema = z.object({
  action: z.string().min(1, 'Action is required'),
  entityId: z.string().optional().nullable(),
  entityType: z.string().optional().nullable(),
  taskId: z.string().optional().nullable(),
  oldValue: z.any().optional(),
  newValue: z.any().optional(),
});
