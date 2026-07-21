import crypto from "crypto";

export function fingerprintDatabaseUrl(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function assertStressDatabase({ destructive = false } = {}) {
  const databaseUrl = process.env.DATABASE_URL;
  const stressUrl = process.env.STRESS_DATABASE_URL;
  const expectedFingerprint = process.env.STRESS_DATABASE_FINGERPRINT;

  if (!databaseUrl || !stressUrl || !expectedFingerprint) {
    throw new Error(
      "Stress database guard requires DATABASE_URL, STRESS_DATABASE_URL, and STRESS_DATABASE_FINGERPRINT."
    );
  }
  if (databaseUrl !== stressUrl) {
    throw new Error("Refusing operation: DATABASE_URL does not equal STRESS_DATABASE_URL.");
  }

  const actualFingerprint = fingerprintDatabaseUrl(databaseUrl);
  const expected = expectedFingerprint.trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(expected) || actualFingerprint !== expected) {
    throw new Error("Refusing operation: stress database fingerprint mismatch.");
  }
  if (destructive && process.env.ALLOW_STRESS_DB_RESET !== "true") {
    throw new Error("Refusing destructive operation: ALLOW_STRESS_DB_RESET must equal true.");
  }

  const parsed = new URL(databaseUrl);
  return { host: parsed.hostname, fingerprintPrefix: actualFingerprint.slice(0, 12) };
}
