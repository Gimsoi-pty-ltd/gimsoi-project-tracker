import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(1, 'Client name is required').max(100),
  contactEmail: z.string().email('Invalid contact email'),
});

export const updateClientSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  contactEmail: z.string().email().optional(),
  version: z.number().int().positive('version is required for optimistic locking'),
}).refine(
  (data) => Object.keys(data).length > 1,
  { message: 'At least one field (besides version) must be provided for update' }
);
