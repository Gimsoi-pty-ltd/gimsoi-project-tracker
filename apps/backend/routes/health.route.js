import express from "express";
import { createRequire } from "module";
import { isSmtpConfigured, smtpClient } from "../services/email/smtp.config.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

const router = express.Router();

async function withTimeout(promise, ms = 2000) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
  });
  try {
    const start = Date.now();
    await Promise.race([promise, timeout]);
    const latency_ms = Date.now() - start;
    clearTimeout(timer);
    return { ok: true, latency_ms };
  } catch (err) {
    clearTimeout(timer);
    const safeCode = /^[A-Z0-9_]+$/.test(err.code || "") ? err.code : "INTERNAL_ERROR";
    return { ok: false, latency_ms: null, detail: safeCode };
  }
}

async function checkDatabase() {
  const { default: prisma } = await import("../lib/prisma.js");
  return withTimeout(prisma.$queryRaw`SELECT 1`, 2000);
}

async function checkMail() {
  if (process.env.NODE_ENV === "test") return { ok: true };
  if (!isSmtpConfigured()) return { ok: false, detail: "NOT_CONFIGURED" };
  return withTimeout(smtpClient.verify(), 5000);
}

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health Check
 *     responses:
 *       200:
 *         description: System is up
 *       503:
 *         description: System is down
 */
router.get("/", async (req, res) => {
  const [db, mail] = await Promise.all([checkDatabase(), checkMail()]);
  
  const status = db.ok ? (mail.ok ? "ok" : "degraded") : "unhealthy";
  return res.status(db.ok ? 200 : 503).json({
    status,
    database: db.ok ? "ok" : "down",
    mail: mail.ok ? "ok" : "down",
    time: new Date().toISOString()
  });
});

router.all("/", (req, res) => {
  res.set("Allow", "GET, OPTIONS").status(405).json({
    status:  "error",
    message: "Method Not Allowed",
  });
});

export default router;
