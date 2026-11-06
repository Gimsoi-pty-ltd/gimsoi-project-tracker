import { z } from 'zod';

const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED', 'BLOCKED']);

export const employeeIdParamsSchema = z.object({
  id: z.string().uuid('Employee id must be a valid UUID'),
});

export const capacityQuerySchema = z.object({
  projectId: z.string().uuid('projectId must be a valid UUID').optional(),
});

export const assignedTasksQuerySchema = z.object({
  projectId: z.string().uuid('projectId must be a valid UUID').optional(),
  status: TaskStatusEnum.optional(),
  limit: z.string().optional(),
  cursor: z.string().optional(),
});