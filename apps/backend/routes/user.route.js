import express from 'express';
import { verifyToken } from '../middleware/verify-token.middleware.js';
import authorize from '../middleware/auth.middleware.js';
import { readLimiter, writeLimiter } from '../middleware/rate-limiter.middleware.js';
import { requireCSRF } from '../middleware/csrf.middleware.js';
import {
  getUsers,
  adminCreateUser,
  updateUserRole,
  updateProfile,
  updateAvatar,
} from '../controllers/user.controller.js';
import { changePassword } from '../controllers/auth.controller.js';
import { upload } from '../utils/upload.js';
import { validate } from "../middleware/validate.middleware.js";
import { adminCreateUserSchema, updateProfileSchema, updateUserRoleSchema, changePasswordSchema } from "../schemas/user.schema.js";

const router = express.Router();

/**
 * ADMIN Endpoints
 */

// List all users (paginated)
router.get('/', readLimiter, verifyToken, authorize('VIEW_USERS'), getUsers);

// Create new user (admin-level bypass)
router.post('/', writeLimiter, verifyToken, authorize('MANAGE_USERS'), requireCSRF, validate(adminCreateUserSchema), adminCreateUser);

// Update user role
router.patch('/:id/role', writeLimiter, verifyToken, authorize('MANAGE_USERS'), requireCSRF, validate(updateUserRoleSchema), updateUserRole);

/**
 * AUTHENTICATED Endpoints (Any Role)
 */

// Update own profile
router.patch('/me', writeLimiter, verifyToken, requireCSRF, validate(updateProfileSchema), updateProfile);

// Change own password
router.patch('/me/password', writeLimiter, verifyToken, requireCSRF, validate(changePasswordSchema), changePassword);

// Upload own avatar
router.post('/me/avatar', writeLimiter, verifyToken, requireCSRF, upload.single('avatar'), updateAvatar);

export default router;
