import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

let smtpConfig;

if (process.env.NODE_ENV === "test") {
  smtpConfig = { jsonTransport: true };
} else if (process.env.NODE_ENV === "development") {
  // Mailtrap sandbox
  smtpConfig = {
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
    secure: false,
    tls: {
      rejectUnauthorized: false, // allow self-signed cert
    },
  };
} else {
  // Production Gmail
  smtpConfig = {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    family: 4,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    connectionTimeout: 10000,
    logger: false,
    debug: false,
  };
}

export const smtpClient = nodemailer.createTransport(smtpConfig);

// Optional: verify connection
if (process.env.NODE_ENV !== "test") {
  smtpClient.verify((err, success) => {
    if (err) {
      console.error("[SMTP] Startup verification FAILED — email delivery unavailable:", err.message);
    } else {
      console.log("[SMTP] Ready.");
    }
  });
}