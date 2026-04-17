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
import { requireCSRF } from "../middleware/csrf.middleware.js";
import { loginLimiter, authLimiter, readLimiter } from "../middleware/rate-limiter.middleware.js";

const router = express.Router();





/**
 * GET /api/auth/check-auth
 * Allowed: ADMIN, PM, INTERN, CLIENT (Authenticated)
 */
router.get("/check-auth", readLimiter, verifyToken, checkAuth);

/**
 * POST /api/auth/signup — Registers a new user (always as INTERN)
 * Allowed: ALL (Public)
 */
router.post("/signup", authLimiter, signup);

/**
 * POST /api/auth/login
 * Allowed: ALL (Public)
 */
router.post("/login", loginLimiter, login);

/**
 * POST /api/auth/logout — Clears the authentication context
 * Allowed: Authenticated Users
 */
router.post("/logout", verifyToken, requireCSRF, logout);

/**
 * POST /api/auth/verify-email
 * Allowed: ALL (Public)
 */
router.post("/verify-email", loginLimiter, verifyEmail);

/**
 * POST /api/auth/forgot-password
 * Allowed: ALL (Public)
 */
router.post("/forgot-password", authLimiter, forgotPassword);

/**
 * POST /api/auth/reset-password/:token
 * Allowed: ALL (Public)
 */
router.post("/reset-password/:token", authLimiter, resetPassword);

export default router;
