import express from "express";
import {
    signup,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    checkAuth,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import { loginLimiter, authLimiter, readLimiter } from "../middleware/rate-limiter.middleware.js";

const router = express.Router();

/**
 * GET /api/auth/check-auth
 * Allowed: Authenticated Users
 */
router.get("/check-auth", readLimiter, verifyToken, checkAuth);

/**
 * POST /api/auth/signup — Registers a new user
 */
router.post("/signup", authLimiter, signup);

/**
 * POST /api/auth/login — Authenticates a user
 */
router.post("/login", loginLimiter, login);

/**
 * POST /api/auth/logout — Clears the authentication context
 */
router.post("/logout", authLimiter, verifyToken, logout);

/**
 * POST /api/auth/verify-email — Verifies email via token
 */
router.post("/verify-email", loginLimiter, verifyEmail);

/**
 * POST /api/auth/forgot-password — Initiates password reset
 */
router.post("/forgot-password", authLimiter, forgotPassword);

/**
 * POST /api/auth/reset-password/:token — Completes password reset
 */
router.post("/reset-password/:token", authLimiter, resetPassword);

export default router;
