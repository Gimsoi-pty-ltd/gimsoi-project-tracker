import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  clientId: z.string().uuid('clientId must be a valid UUID'),
  description: z.string().max(2000).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
  endDate: z.coerce.date().optional().nullable(),
  version: z.number().int().positive('version is required for optimistic locking'),
}).refine(
  (data) => Object.keys(data).length > 1,
  { message: 'At least one field (besides version) must be provided for update' }
);
