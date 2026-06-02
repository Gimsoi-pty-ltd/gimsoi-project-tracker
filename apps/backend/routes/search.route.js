import express from 'express';
import { verifyToken } from '../middleware/verify-token.middleware.js';
import { readLimiter } from '../middleware/rate-limiter.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { searchHandler } from '../controllers/search.controller.js';
import { searchSchema } from '../schemas/search.schema.js';

const router = express.Router();

/**
 * GET /api/search — Global Search
 * Allowed: Any authenticated user
 */
router.get('/', readLimiter, verifyToken, validate(searchSchema, 'query'), searchHandler);

export default router;
