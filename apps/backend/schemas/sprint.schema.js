import { z } from 'zod';

const SprintStatusEnum = z.enum(['PLANNING', 'ACTIVE', 'CLOSED']);

export const createSprintSchema = z.object({
  name: z.string().min(1, 'Sprint name is required').max(100),
  projectId: z.string().uuid('projectId must be a valid UUID'),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  status: SprintStatusEnum.optional().default('PLANNING'),
});

export const updateSprintSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  status: SprintStatusEnum.optional(),
  version: z.number().int().positive('version is required for optimistic locking'),
}).refine(
  (data) => Object.keys(data).length > 1,
  { message: 'At least one field (besides version) must be provided for update' }
);

export const updateSprintStatusSchema = z.object({
  status: SprintStatusEnum,
  version: z.number().int().positive('version is required for optimistic locking'),
});
