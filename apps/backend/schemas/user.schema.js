import { z } from 'zod';

// Roles allowed in the system — must match Prisma Role enum exactly.
const RoleEnum = z.enum(['ADMIN', 'PM', 'INTERN', 'CLIENT']);

export const adminCreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Full name is required').max(100),
  role: RoleEnum,
});

export const updateUserRoleSchema = z.object({
  role: RoleEnum,
  version: z.number().int().positive('version is required for optimistic locking'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  email: z.string().email('Invalid email address').optional(),
  version: z.number().int().positive('version is required for optimistic locking'),
}).refine(
  (data) => Object.keys(data).length > 1,
  { message: 'At least one field (besides version) must be provided for update' }
);
