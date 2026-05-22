import { verifyStatelessCsrfToken, generateStatelessCsrfToken } from "../utils/security.utils.js";

/**
 * Global CSRF protection middleware using a stateless Double Submit Cookie pattern.
 * Validates the 'x-csrf-token' header against the user ID and timestamp signature.
 */
export const csrfProtection = (req, res, next) => {
    // 1. Skip validation for read-only methods
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
    }

    // 2. Skip if user is not authenticated (auth routes should handle their own safety)
    console.log(`[CSRF Debug] Method: ${req.method}, URL: ${req.url}, User: ${req.user ? req.user.id : 'none'}`);
    if (!req.user || !req.user.id) {
        return next();
    }


    // 3. Extract token from header or body (fallback)
    const token = req.headers["x-csrf-token"] || req.body?._csrf;

    if (!token) {
        console.error(`[CSRF Error] Missing token - Method: ${req.method}, URL: ${req.url}`);
        return res.status(403).json({ success: false, message: "Invalid or missing CSRF token." });
    }


    // 4. Verify the token signature against the current user session
    const isValid = verifyStatelessCsrfToken(req.user.id, token);

    if (!isValid) {
        console.error(`[CSRF Error] Validation failed - User: ${req.user.id}, Method: ${req.method}, URL: ${req.url}`);
        return res.status(403).json({ success: false, message: "Invalid or expired CSRF token." });
    }

    // Sanitize body if it contains the CSRF token
    if (req.body && req.body._csrf) {
        delete req.body._csrf;
    }

    next();
};

/**
 * Utility to generate a token and return it.
 * Used by server.js to provide a public token endpoint.
 */
export const generateCsrfToken = (req, res) => {
    if (!req.user || !req.user.id) {
        throw new Error("CSRF token can only be generated for authenticated users.");
    }
    return generateStatelessCsrfToken(req.user.id);
};

export const csrfErrorHandler = (err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN' || err.status === 403) {
        return res.status(403).json({
            success: false,
            message: "Invalid CSRF token",
        });
    }
    next(err);
};

// Shims for backward compatibility
export const requireCSRF = csrfProtection;
