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
import { verifyToken } from "../middleware/verifyToken.js";
import { authLimiter, loginLimiter } from "../middleware/rateLimiter.js";
import { csrfProtection, generateCsrfToken } from "../middleware/csrfProtection.js";

const router = express.Router();

// CSRF token endpoint — SPA calls this on load to obtain a token
router.get("/csrf-token", (req, res) => {
    const token = generateCsrfToken(req, res);
    res.json({ success: true, csrfToken: token });
});

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", authLimiter, csrfProtection, signup);

router.post("/login", loginLimiter, csrfProtection, login);

router.post("/logout", csrfProtection, logout);

router.post("/verify-email", authLimiter, csrfProtection, verifyEmail);

router.post("/forgot-password", authLimiter, csrfProtection, forgotPassword);

router.post("/reset-password/:token", authLimiter, csrfProtection, resetPassword);

export default router;
