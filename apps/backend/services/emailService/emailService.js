import { smtpClient } from "./config/smtpClientConfig.js";
import {
    VERIFICATION_EMAIL_TEMPLATE,
    PASSWORD_RESET_REQUEST_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE,
    WELCOME_EMAIL_TEMPLATE,
} from "./emailTemplates/emailTemplates.js";

/**
 * Send a Verification Email
 * Replaces "{verificationCode}" in the template
 */
export const sendVerificationEmail = async (email, verificationToken) => {
    // Log the code immediately so the user can see it in the terminal
    console.log("-----------------------------------------");
    console.log(`VERIFICATION CODE FOR ${email}: ${verificationToken}`);
    console.log("-----------------------------------------");

    try {
        await smtpClient.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace(
                "{verificationCode}",
                verificationToken
            ),
            category: "Email Verification",
        });

        console.log("Verification email sent successfully");
    } catch (error) {
        console.error("Email service error (sending verification failed):", error.message);
        // Do NOT throw error here to prevent the server from crashing.
        // The user can still verify manually using the code logged above.
    }
};

export const sendWelcomeEmail = async (email, name) => {
    try {
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const loginURL = `${clientUrl}/login`;

        const htmlContent = WELCOME_EMAIL_TEMPLATE.replace("{name}", name).replace(
            "{loginURL}",
            loginURL
        );

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Welcome to Our Community",
            html: htmlContent,
        };

        // 4. Send the email
        await smtpClient.sendMail(mailOptions);
        console.log("Welcome email sent successfully");
    } catch (error) {
        console.error("Welcome email service error (sending failed):", error.message);
        // Do NOT throw error here to prevent the server from crashing.
        // It's better to let the user verify their email even if the welcome email fails.
    }
};

// ==================================== //
/**
 * Send Password Reset Request Email
 * Replaces "{resetURL}" in the template
 */
export const sendPasswordResetEmail = async (email, resetURL) => {
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
 * No replacements needed for this template
 */
export const sendResetSuccessEmail = async (email) => {
    try {
        const response = await smtpClient.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        });

        console.log(
            "Password reset success email sent successfully",
            response.messageId
        );
    } catch (error) {
        console.error("Error sending password reset success email", error);
        throw new Error("Error sending password reset success email");
    }
};
