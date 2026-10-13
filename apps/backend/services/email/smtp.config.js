import nodemailer from "nodemailer";

const port = Number(process.env.SMTP_PORT || 465);
const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE.toLowerCase() === "true"
    : port === 465;

export const isSmtpConfigured = () =>
    Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

export const smtpClient = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure,
    ...(port === 587 ? { requireTLS: true } : {}),
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
});