import bcryptjs from "bcryptjs";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import ROLES from "../constants/roles.js";
import { NotFoundError, ForbiddenError, ConflictError } from "../utils/errors.js";
import {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendPasswordResetSuccessEmail,
} from "./email/email.service.js";

const BCRYPT_SALT_ROUNDS = 10;

export const signup = async ({ email, password, fullName }) => {
    const userAlreadyExists = await prisma.user.findUnique({ where: { email } });
    if (userAlreadyExists) {
        throw new ConflictError("User already exists");
    }

    const hashedPassword = await bcryptjs.hash(password, BCRYPT_SALT_ROUNDS);
    const verificationToken = crypto.randomInt(100000, 999999).toString();

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            fullName,
            role: ROLES.INTERN,
            verificationToken,
            verificationTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
    });

    sendVerificationEmail(user.email, verificationToken)
        .catch(err => console.error("Failed to send verification email:", err));

    return user;
};

export const verifyEmail = async (code) => {
    const user = await prisma.user.findFirst({
        where: {
            verificationToken: code,
            verificationTokenExpiresAt: { gt: new Date() },
        },
    });

    if (!user) {
        // HTTP 403 maps correctly to ForbiddenError or we could use a custom 400 error.
        const err = new Error("Invalid or expired verification code");
        err.statusCode = 400;
        throw err;
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

    return updatedUser;
};

export const login = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        const err = new Error("Invalid credentials");
        err.statusCode = 400;
        throw err;
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
        const err = new Error("Invalid credentials");
        err.statusCode = 400;
        throw err;
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
    });

    return user;
};

export const forgotPassword = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return; // Silent success prevents user enumeration
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
};

export const resetPassword = async (token, password) => {
    const user = await prisma.user.findFirst({
        where: {
            resetPasswordToken: token,
            resetPasswordExpiresAt: { gt: new Date() },
        },
    });

    if (!user) {
        const err = new Error("Invalid or expired reset token");
        err.statusCode = 400;
        throw err;
    }

    const hashedPassword = await bcryptjs.hash(password, BCRYPT_SALT_ROUNDS);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpiresAt: null,
        },
    });

    await sendResetSuccessEmail(user.email);
};

export const checkAuth = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        omit: { password: true },
    });

    if (!user) {
        const error = new Error("Unauthorized - user not found");
        error.statusCode = 401;
        throw error;
    }

    return user;
};
