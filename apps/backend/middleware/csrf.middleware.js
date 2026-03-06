import { doubleCsrf } from "csrf-csrf";

const isProduction = process.env.NODE_ENV === "production";

const {
    invalidCsrfTokenError,
    doubleCsrfProtection,
    generateCsrfToken,
} = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET || process.env.JWT_SECRET,
    getSessionIdentifier: (req) => req.ip || "anonymous",
    cookieName: isProduction ? "__Host-csrf" : "csrf-token",
    cookieOptions: {
        httpOnly: true,      // Token delivered via JSON endpoint, not JS cookie access
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
    },
    getCsrfTokenFromRequest: (req) => req.headers["x-csrf-token"],
});

/**
 * Express error-handling middleware for invalid CSRF tokens.
 * Must be registered AFTER routes so it catches errors thrown by doubleCsrfProtection.
 */
export const csrfErrorHandler = (err, req, res, next) => {
    if (err === invalidCsrfTokenError) {
        return res.status(403).json({
            success: false,
            message: "Invalid CSRF token",
        });
    }
    next(err);
};

export {
    doubleCsrfProtection as csrfProtection,
    generateCsrfToken,
};
