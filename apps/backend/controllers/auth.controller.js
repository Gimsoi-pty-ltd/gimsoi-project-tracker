import bcryptjs from "bcryptjs";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import ROLES from "../constants/roles.js";
import {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendResetSuccessEmail,
} from "../services/email.service.js";

const VALID_ROLES = Object.values(ROLES);

export const signup = async (req, res) => {
    const { email, password, fullName } = req.body;    // role intentionally excluded

    try {
        if (!email || !password || !fullName) {
            throw new Error("All fields are required");
        }

        const userAlreadyExists = await prisma.user.findUnique({ where: { email } });
        if (userAlreadyExists) {
            return res
                .status(400)
                .json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        // crypto.randomInt(min, max) is exclusive of max — range is 100000..999999 inclusive
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
        res.status(400).json({ success: false, message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
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
        console.log("error in verifyEmail ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res
            .status(400)
            .json({ success: false, message: "Email and password are required" });
    }

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
        console.log("Error in login ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Return 200 regardless — do not reveal account existence
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
            message: "Password reset link sent to your email",
        });
    } catch (error) {
        console.log("Error in forgotPassword ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const resetPassword = async (req, res) => {
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
        console.log("Error in resetPassword ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const checkAuth = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            omit: { password: true },
        });

        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Error in checkAuth ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};
