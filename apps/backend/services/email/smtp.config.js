import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a reusable SMTP client or a dummy for testing
export const smtpClient = process.env.NODE_ENV === "test"
    ? nodemailer.createTransport({
        jsonTransport: true,
    })
    : nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        requireTLS: true,   // Abort if STARTTLS is unavailable — never send plaintext
        family: 4, // Force IPv4 to avoid IPv6 timeouts on Render
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
        connectionTimeout: 10000, // 10 seconds
        logger: false, // Log to console
        debug: false, // Internal info logs
    });

// Optional: verify connection
if (process.env.NODE_ENV !== "test") {
    smtpClient.verify((err, success) => {
        if (err) {
            // Log at ERROR level so monitoring systems capture it.
            // We do not crash the server on SMTP failure — auth flows still work,
            // only email delivery is affected. Operators should alert on this log line.
            console.error("[SMTP] Startup verification FAILED — email delivery unavailable:", err.message);
        } else {
            console.log("[SMTP] Ready.");
        }
    });
}
