import { doubleCsrf } from "csrf-csrf";

const doubleCsrfResult = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET || "mocked_test_secret_for_dev_only",
    cookieName: "XSRF-TOKEN",
    cookieOptions: {
        httpOnly: false, // Must be false so frontend can read it for Double Submit
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
    },
    size: 64,
    ignoredMethods: ["GET", "HEAD", "OPTIONS"],
    getTokenFromRequest: (req) => req.headers["x-csrf-token"],
    getSessionIdentifier: (req) => req.ip || "fixed-id",
});

export const {
    doubleCsrfProtection: csrfProtection,
    generateCsrfToken
} = doubleCsrfResult;

/**
 * Dummy middleware to maintain compatibility with routes that were using the stateless requireCSRF.
 * Global CSRF protection is now handled in server.js via doubleCsrfProtection.
 */
export const requireCSRF = (req, res, next) => next();

export const csrfErrorHandler = (error, req, res, next) => {
    if (error.code === "EBADCSRFTOKEN") {
        return res.status(403).json({
            success: false,
            message: "Invalid or missing CSRF token.",
        });
    }
    next(error);
};
