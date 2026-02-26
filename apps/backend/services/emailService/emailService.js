import { smtpClient } from "./config/smtpClientConfig.js";
import {
    VERIFICATION_EMAIL_TEMPLATE,
    PASSWORD_RESET_REQUEST_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE,
    WELCOME_EMAIL_TEMPLATE,
} from "./emailTemplates/emailTemplates.js";

// In test mode, skip all real SMTP calls — no credentials needed
const IS_TEST = process.env.NODE_ENV === "test";

/**
 * Send a Verification Email
 */
export const sendVerificationEmail = async (email, verificationToken) => {
    if (IS_TEST) {
        console.log(`[TEST] Skipping verification email to ${email}`);
        return;
    }
    try {
        const response = await smtpClient.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification",
        });
        console.log("Verification email sent successfully", response.messageId);
    } catch (error) {
        console.error("Error sending verification email", error);
        throw new Error("Error sending verification email");
    }
};

export const sendWelcomeEmail = async (email, name) => {
    if (IS_TEST) {
        console.log(`[TEST] Skipping welcome email to ${email}`);
        return;
    }
    try {
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const loginURL = `${clientUrl}/login`;
        const htmlContent = WELCOME_EMAIL_TEMPLATE.replace("{name}", name).replace("{loginURL}", loginURL);
        const response = await smtpClient.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Welcome to Our Community",
            html: htmlContent,
        });
        console.log("Welcome email sent successfully:", response.messageId);
        return response;
    } catch (error) {
        console.error("Error sending welcome email:", error);
        throw new Error(`Error sending welcome email: ${error.message}`);
    }
};

/**
 * Send Password Reset Request Email
 */
export const sendPasswordResetEmail = async (email, resetURL) => {
    if (IS_TEST) {
        console.log(`[TEST] Skipping password reset email to ${email}`);
        return;
    }
    try {
        const response = await smtpClient.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
        });
        console.log("Password reset email sent successfully", response.messageId);
    } catch (error) {
        console.error("Error sending password reset email", error);
        throw new Error("Error sending password reset email");
    }
};

/**
 * Send Password Reset Success Email
 */
export const sendResetSuccessEmail = async (email) => {
    if (IS_TEST) {
        console.log(`[TEST] Skipping reset success email to ${email}`);
        return;
    }
    try {
        const response = await smtpClient.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        });
        console.log("Password reset success email sent successfully", response.messageId);
    } catch (error) {
        console.error("Error sending password reset success email", error);
        throw new Error("Error sending password reset success email");
    }
};
