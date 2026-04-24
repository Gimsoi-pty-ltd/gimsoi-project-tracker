import crypto from 'crypto';

const CSRF_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generates a stateless signed CSRF token using HMAC with expiration.
 * Format: signature.timestamp
 */
export function generateStatelessCsrfToken(userId) {
    const secret = process.env.CSRF_SECRET;
    if (!secret) throw new Error("CRITICAL: CSRF_SECRET is not defined in environment");

    const timestamp = Date.now();
    const payload = `${userId}:${timestamp}`;
    
    const signature = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

    return `${signature}.${timestamp}`;
}

/**
 * Validates a stateless CSRF token without database I/O.
 */
export function verifyStatelessCsrfToken(userId, providedToken) {
    if (!providedToken || typeof providedToken !== 'string') return false;

    const parts = providedToken.split('.');
    if (parts.length !== 2) return false;

    const [providedSignature, timestampStr] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // 1. Check expiration
    if (isNaN(timestamp) || Date.now() - timestamp > CSRF_MAX_AGE_MS) {
        return false; 
    }

    // 2. Validate cryptographic signature
    const secret = process.env.CSRF_SECRET;
    const payload = `${userId}:${timestamp}`;
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "hex");
    const actualBuf = Buffer.from(providedSignature, "hex");

    if (expectedBuf.length !== actualBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
}
