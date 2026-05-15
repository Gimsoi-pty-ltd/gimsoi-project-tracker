import express from 'express';
import { verifyToken } from '../middleware/verify-token.middleware.js';
import authorize from '../middleware/authorize.middleware.js';
import { readLimiter, writeLimiter } from '../middleware/rate-limiter.middleware.js';
import { requireCSRF } from '../middleware/csrf.middleware.js';
import {
  getUsers,
  adminCreateUser,
  updateUserRole,
  updateProfile,
  updateAvatar,
} from '../controllers/user.controller.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

/**
 * ADMIN Endpoints
 */

// List all users (paginated)
router.get('/', readLimiter, verifyToken, authorize('VIEW_USERS'), getUsers);

// Create new user (admin-level bypass)
router.post('/', writeLimiter, verifyToken, authorize('MANAGE_USERS'), requireCSRF, adminCreateUser);

// Update user role
router.patch('/:id/role', writeLimiter, verifyToken, authorize('MANAGE_USERS'), requireCSRF, updateUserRole);

/**
 * AUTHENTICATED Endpoints (Any Role)
 */

// Update own profile
router.patch('/me', writeLimiter, verifyToken, requireCSRF, updateProfile);

// Upload own avatar
router.post('/me/avatar', writeLimiter, verifyToken, requireCSRF, upload.single('avatar'), updateAvatar);

export default router;
