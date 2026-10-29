import { z } from "zod";

export const signupSchema = z.object({
    email: z.string().min(1, "Email is required").email("Email must be a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    fullName: z.string().min(1, "Full name is required").max(100),
});

export const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Email must be a valid email address"),
    password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
    code: z.string().min(1, "Verification code is required"),
});

export const resendVerificationSchema = z.object({
    email: z.string().min(1, "Email is required").email("Email must be a valid email address"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().min(1, "Email is required").email("Email must be a valid email address"),
});

export const resetPasswordParamsSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
});

export const resetPasswordBodySchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
});
