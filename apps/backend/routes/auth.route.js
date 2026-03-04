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
import { authLimiter, loginLimiter } from "../middleware/rate-limiter.middleware.js";
import { generateCsrfToken } from "../middleware/csrf.middleware.js";

const router = express.Router();

// CSRF token endpoint — SPA calls this on load to obtain a token
router.get("/csrf-token", (req, res) => {
    const token = generateCsrfToken(req, res);
    res.json({ success: true, csrfToken: token });
});

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", authLimiter, signup);

router.post("/login", loginLimiter, login);

router.post("/logout", logout);

router.post("/verify-email", loginLimiter, verifyEmail);

router.post("/forgot-password", authLimiter, forgotPassword);

router.post("/reset-password/:token", authLimiter, resetPassword);

export default router;
