import bcryptjs from "bcryptjs";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import ROLES from "../constants/roles.js";
import { TOKEN_TTL_VERIFICATION_MS, TOKEN_TTL_RESET_MS } from "../constants/auth.js";
import { NotFoundError, ForbiddenError, ConflictError, ValidationError, UnauthorizedError } from "../utils/errors.js";
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
            verificationTokenExpiresAt: new Date(Date.now() + TOKEN_TTL_VERIFICATION_MS),
        },
    });

    await sendVerificationEmail(user.email, verificationToken).catch(err => {
        console.error("Failed to send verification email:", err);
        throw new Error("Account created but verification email could not be sent. Please contact support.");
    });

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
        throw new ValidationError("Invalid or expired verification code");
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
        throw new ValidationError("Invalid credentials");
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
        throw new ValidationError("Invalid credentials");
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
    const resetTokenExpiresAt = new Date(Date.now() + TOKEN_TTL_RESET_MS);

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
        throw new ValidationError("Invalid or expired reset token");
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

    await sendPasswordResetSuccessEmail(user.email);
};

export const checkAuth = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        omit: { password: true },
    });

    if (!user) {
        throw new UnauthorizedError("Unauthorized - user not found");
    }

    return user;
};

export const sanitizeUser = (user) => {
    if (!user) return user;
    const { password, resetPasswordToken, verificationToken, ...safeUser } = user;
    return safeUser;
};
