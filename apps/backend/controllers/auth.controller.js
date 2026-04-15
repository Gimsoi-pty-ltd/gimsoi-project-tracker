import * as authService from "../services/auth.service.js";
import { generateTokenAndSetCookie } from "../utils/jwt.utils.js";

export const signup = async (req, res, next) => {
    try {
        const { email, password, fullName } = req.body;
        if (!email || !password || !fullName) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        
        const user = await authService.signup({ email, password, fullName });
        const token = generateTokenAndSetCookie(res, user.id, user.role);
        
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: authService.sanitizeUser(user),
            token,
        });
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code) {
           return res.status(400).json({ success: false, message: "Verification code is required" });
        }

        const user = await authService.verifyEmail(code);
        
        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: authService.sanitizeUser(user),
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const user = await authService.login(email, password);
        const token = generateTokenAndSetCookie(res, user.id, user.role);

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: authService.sanitizeUser(user),
            token,
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        await authService.forgotPassword(email);

        return res.status(200).json({
            success: true,
            message: "If that email is registered, a reset link has been sent.",
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ success: false, message: "Token and password are required" });
        }

        await authService.resetPassword(token, password);

        return res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        next(error);
    }
};

export const checkAuth = async (req, res, next) => {
    try {
        const user = await authService.checkAuth(req.user.id);
        return res.status(200).json({ success: true, user: authService.sanitizeUser(user) });
    } catch (error) {
        next(error);
    }
};
