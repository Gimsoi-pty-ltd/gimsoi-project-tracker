import { isSmtpConfigured, smtpClient } from "./smtp.config.js";
import {
    VERIFICATION_EMAIL_TEMPLATE,
    PASSWORD_RESET_REQUEST_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE,
    WELCOME_EMAIL_TEMPLATE,
} from "./templates.js";

/**
 * Escapes HTML special characters in strings inserted into email templates.
 * Handles null/undefined by coercing to empty string.
 * @param {unknown} str
 * @returns {string}
 */
export const escapeHtml = (str) =>
    String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const isDevMailFallback = () =>
    process.env.NODE_ENV !== "production" && !isSmtpConfigured();

const sendEmail = async (to, subject, html) => {
    if (process.env.NODE_ENV === "test") return { mocked: true };

    if (isDevMailFallback()) {
        console.warn(
            `[SMTP] Not configured — skipped "${subject}" to ${to}. ` +
                "Set GMAIL_USER and GMAIL_APP_PASSWORD in .env, or read dev codes in the server log."
        );
        return { devSkipped: true };
    }

    try {
        const response = await smtpClient.sendMail({
            from: process.env.GMAIL_FROM_NAME
                ? { name: process.env.GMAIL_FROM_NAME, address: process.env.GMAIL_USER }
                : process.env.GMAIL_USER,
            to,
            subject,
            html,
        });
        return response;
    } catch (error) {
        console.error(`[SMTP] Failed to send "${subject}":`, {
            message: error.message,
            code: error.code,
            command: error.command,
            statusCode: error.statusCode,
        });
        throw new Error(`Error sending email: ${subject}`);
    }
};

/**
 * Send a Verification Email
 * Replaces "{verificationCode}" in the template
 */
export const sendVerificationEmail = async (email, verificationToken) => {
    if (process.env.NODE_ENV === "test") return { mocked: true };

    if (isDevMailFallback()) {
        console.warn(
            `[SMTP] Not configured — verification code for ${email}: ${verificationToken}`
        );
        return { devLogged: true };
    }

    return sendEmail(
        email,
        "Verify your email",
        VERIFICATION_EMAIL_TEMPLATE.replace(
            "{verificationCode}",
            escapeHtml(verificationToken)
        )
    );
};

export const sendWelcomeEmail = async (email, name) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const loginURL = `${clientUrl}/login`;
    const htmlContent = WELCOME_EMAIL_TEMPLATE.replace("{name}", escapeHtml(name)).replace(
        "{loginURL}",
        encodeURI(loginURL)
    );

    return sendEmail(email, "Welcome to Our Community", htmlContent);
};

// ==================================== //
/**
 * Send Password Reset Request Email
 * Replaces "{resetURL}" in the template
 */
export const sendPasswordResetEmail = async (email, resetURL) => {
    return sendEmail(
        email,
        "Reset your password",
        PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", escapeHtml(encodeURI(resetURL)))
    );
};

/**
 * Send Password Reset Success Email
 * No replacements needed for this template
 */
export const sendPasswordResetSuccessEmail = async (email) => {
    return sendEmail(email, "Password Reset Successful", PASSWORD_RESET_SUCCESS_TEMPLATE);
};
