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
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  email: z.string().email('Invalid email address').optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);
