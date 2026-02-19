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

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", authLimiter, signup);

router.post("/login", loginLimiter, login);

router.post("/logout", logout);

router.post("/verify-email", authLimiter, verifyEmail);

router.post("/forgot-password", authLimiter, forgotPassword);

router.post("/reset-password/:token", authLimiter, resetPassword);

export default router;
