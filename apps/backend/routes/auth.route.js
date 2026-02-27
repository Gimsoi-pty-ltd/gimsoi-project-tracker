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
import { generateCsrfToken } from "../middleware/csrfProtection.js";
import { validateCreateTask, validateUpdateTask } from "../middleware/validateTaskPayload.js";

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

router.post("/verify-email", authLimiter, verifyEmail);

router.post("/forgot-password", authLimiter, forgotPassword);

router.post("/reset-password/:token", authLimiter, resetPassword);

router.post("/", writeLimiter, verifyToken, authorize("CREATE_TASK"), validateCreateTask, (req, res) => {
  res.json({ message: "Task created successfully." });
});

router.put("/:id", writeLimiter, verifyToken, authorize("UPDATE_TASK"), validateUpdateTask, (req, res) => {
  res.json({ message: `Task ${req.params.id} updated successfully.` });
});
export default router;
