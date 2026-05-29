import { z } from 'zod';

export const createPhaseSchema = z.object({
    name: z.string().min(1, 'Phase name is required'),
    description: z.string().optional(),
    projectId: z.string().uuid('projectId must be a valid UUID'),
    startDate: z.string().datetime({ offset: true }).optional().or(z.literal('')).nullish(),
    endDate: z.string().datetime({ offset: true }).optional().or(z.literal('')).nullish(),
    status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED']).optional(),
    order: z.number().int().min(0).optional(),
});

export const updatePhaseSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    startDate: z.string().datetime({ offset: true }).optional().or(z.literal('')).nullish(),
    endDate: z.string().datetime({ offset: true }).optional().or(z.literal('')).nullish(),
    status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED']).optional(),
    order: z.number().int().min(0).optional(),
    version: z.number().int().positive('version is required for optimistic locking'),
}).refine(
    (data) => Object.keys(data).length > 1,
    { message: 'At least one field (besides version) must be provided for update' }
);
