import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a reusable SMTP client
export const smtpClient = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

// Optional: verify connection
smtpClient.verify((err, success) => {
    if (err) {
        console.error("SMTP client verification failed:", err);
    } else {
        console.log("SMTP client ready to send emails");
    }
});
