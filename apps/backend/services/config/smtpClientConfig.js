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
            console.error("SMTP client verification failed:", err);
        } else {
            console.log("SMTP client ready to send emails");
        }
    });
}
