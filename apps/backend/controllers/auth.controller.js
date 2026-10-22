import bcryptjs from "bcryptjs";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import { generateTokenAndSetCookie } from "../utils/jwt.utils.js";
import { generateStatelessCsrfToken } from "../utils/security.utils.js";
import ROLES from "../constants/roles.js";
import {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendPasswordResetSuccessEmail as sendResetSuccessEmail,
} from "../services/email/email.service.js";
import { ConflictError } from "../utils/errors.js";

const VALID_ROLES = Object.values(ROLES);

export const signup = async (req, res, next) => {
    const { email, password, fullName } = req.body;

    try {
        const userAlreadyExists = await prisma.user.findUnique({ where: { email } });
        if (userAlreadyExists) {
            throw new ConflictError("User already exists");
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = crypto.randomInt(100000, 999999).toString();

        const assignedRole = ROLES.INTERN;

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName,
                role: assignedRole,
                verificationToken,
                verificationTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        });

        const token = generateTokenAndSetCookie(res, user.id, user.role);
        
        // CSRF Token setup
        const csrfToken = generateStatelessCsrfToken(user.id);
        res.cookie("XSRF-TOKEN", csrfToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        sendVerificationEmail(user.email, verificationToken)
            .catch(err => console.error("Failed to send verification email:", err));

        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: userWithoutPassword,
            token,
        });
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (req, res, next) => {
    const { code } = req.body;
    try {
        const user = await prisma.user.findFirst({
            where: {
                verificationToken: code,
                verificationTokenExpiresAt: { gt: new Date() },
            },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code",
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
                verificationTokenExpiresAt: null,
            },
        });

        await sendWelcomeEmail(updatedUser.email, updatedUser.fullName);

        const { password: _, ...userWithoutPassword } = updatedUser;
        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: userWithoutPassword,
        });
    } catch (error) {
        next(error);
    }
};

export const resendVerification = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.isVerified) {
            return res.status(200).json({
                success: true,
                message: "If your email is registered and unverified, a new code has been sent.",
            });
        }

        const verificationToken = crypto.randomInt(100000, 999999).toString();
        const verificationTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationToken,
                verificationTokenExpiresAt,
            },
        });

        sendVerificationEmail(user.email, verificationToken)
            .catch(err => console.error("Failed to resend verification email:", err));

        res.status(200).json({
            success: true,
            message: "If your email is registered and unverified, a new code has been sent.",
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid credentials" });
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);

        if (!isPasswordValid) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid credentials" });
        }

        const token = generateTokenAndSetCookie(res, user.id, user.role);

        // CSRF Token setup
        const csrfToken = generateStatelessCsrfToken(user.id);
        res.cookie("XSRF-TOKEN", csrfToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: userWithoutPassword,
            token,
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        res.clearCookie("token");
        res.clearCookie("XSRF-TOKEN");
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        if (next) next(error);
        else res.status(500).json({ success: false, message: error.message });
    }
};

export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If that email is registered, a reset link has been sent.",
            });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpiresAt: resetTokenExpiresAt,
            },
        });

        await sendPasswordResetEmail(
            user.email,
            `${process.env.CLIENT_URL}/reset-password/${resetToken}`
        );

        res.status(200).json({
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

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpiresAt: { gt: new Date() },
            },
        });

        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid or expired reset token" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpiresAt: null,
            },
        });

        await sendResetSuccessEmail(user.email);

        res
            .status(200)
            .json({ success: true, message: "Password reset successful" });
    } catch (error) {
        next(error);
    }
};

export const checkAuth = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            omit: { password: true },
        });

        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        const isPasswordCorrect = await bcryptjs.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: "Incorrect current password" });
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        next(error);
    }
};

