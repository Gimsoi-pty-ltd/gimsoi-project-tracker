import { z } from 'zod';

const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED', 'BLOCKED']);
const TaskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(5000).optional().nullable(),
  projectId: z.string().uuid('projectId must be a valid UUID'),
  sprintId: z.string().uuid('sprintId must be a valid UUID').optional().nullable(),
  phaseId: z.string().uuid('phaseId must be a valid UUID').optional().nullable(),
  assigneeId: z.string().uuid('assigneeId must be a valid UUID').optional().nullable(),
  priority: TaskPriorityEnum.optional().default('MEDIUM'),
  isBlocked: z.boolean().optional().default(false),
  dueDate: z.coerce.date().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  status: TaskStatusEnum.optional(),
  sprintId: z.string().uuid().optional().nullable(),
  phaseId: z.string().uuid().optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable(),
  priority: TaskPriorityEnum.optional(),
  isBlocked: z.boolean().optional(),
  dueDate: z.coerce.date().optional().nullable(),
  version: z.number().int().positive('version is required for optimistic locking'),
}).refine(
  (data) => Object.keys(data).length > 1, // At least one field + version
  { message: 'At least one field (besides version) must be provided for update' }
);

const TaskIdentifierSchema = z.object({
  id: z.string().uuid('Task ID must be a valid UUID'),
  version: z.number().int().positive('Task version is required for optimistic locking'),
});

export const bulkUpdateTasksSchema = z.object({
  tasks: z.array(TaskIdentifierSchema).min(1, 'At least one task must be provided for bulk update'),
  updateData: z.object({
    status: TaskStatusEnum.optional(),
    sprintId: z.string().uuid().optional().nullable(),
    phaseId: z.string().uuid().optional().nullable(),
    assigneeId: z.string().uuid().optional().nullable(),
    priority: TaskPriorityEnum.optional(),
    isBlocked: z.boolean().optional(),
    dueDate: z.coerce.date().optional().nullable(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided in updateData for bulk update' }
  )
});

export const bulkDeleteTasksSchema = z.object({
  tasks: z.array(TaskIdentifierSchema).min(1, 'At least one task must be provided for bulk delete'),
});

export const listTasksSchema = z.object({
  projectId: z.string().uuid('projectId must be a valid UUID'),
  status: TaskStatusEnum.optional(),
  isBlocked: z.preprocess((val) => val === 'true' ? true : val === 'false' ? false : val, z.boolean().optional()),
  isOverdue: z.preprocess((val) => val === 'true' ? true : val === 'false' ? false : val, z.boolean().optional()),
  limit: z.string().optional(),
  cursor: z.string().optional(),
  sortBy: z.enum(['urgency']).optional(),
});
