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

router.post("/logout", authLimiter, verifyToken, requireCSRF, logout);

router.post("/verify-email", loginLimiter, verifyEmail);

router.post("/forgot-password", authLimiter, forgotPassword);

router.post("/reset-password/:token", authLimiter, resetPassword);

export default router;
