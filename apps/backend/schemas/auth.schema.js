import { z } from "zod";

export const signupSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    fullName: z.string().min(1, "Full name is required").max(100),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
    code: z.string().regex(/^\d{6}$/, "Verification code must be a 6-digit number"),
});

export const resendVerificationSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const resetPasswordParamsSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
});

export const resetPasswordBodySchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
});
