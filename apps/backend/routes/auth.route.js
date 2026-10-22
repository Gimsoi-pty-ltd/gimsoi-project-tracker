import express from "express";
import {
    signup,
    login,
    logout,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    checkAuth,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import { populateUser } from "../middleware/populate-user.middleware.js";
import { loginLimiter, authLimiter, readLimiter } from "../middleware/rate-limiter.middleware.js";
import { generateCsrfToken } from "../middleware/csrf.middleware.js";

const router = express.Router();

/**
 * GET /api/auth/check-auth
 * Allowed: Authenticated Users
 */
router.get("/check-auth", readLimiter, verifyToken, checkAuth);

/**
 * GET /api/auth/csrf-token
 * Returns a stateless CSRF token for the authenticated user.
 */
router.get("/csrf-token", readLimiter, populateUser, (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.json({ success: true, csrfToken: null, message: "No active session; CSRF not required." });
        }
        const token = generateCsrfToken(req, res);
        res.json({ success: true, csrfToken: token });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

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
 * POST /api/auth/resend-verification — Resends verification code
 */
router.post("/resend-verification", authLimiter, resendVerification);

/**
 * POST /api/auth/forgot-password — Initiates password reset
 */
router.post("/forgot-password", authLimiter, forgotPassword);

/**
 * POST /api/auth/reset-password/:token — Completes password reset
 */
router.post("/reset-password/:token", authLimiter, resetPassword);

export default router;
