import { verifyStatelessCsrfToken } from "../utils/security.utils.js";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const requireCSRF = async (req, res, next) => {
    if (!MUTATING_METHODS.has(req.method)) {
        return next();
    }

    const tokenFromHeader = req.headers["x-csrf-token"];
    const tokenFromBody = req.body?._csrf;
    const clientToken = tokenFromHeader || tokenFromBody;

    if (!clientToken) {
        return res.status(403).json({ success: false, message: "Invalid or missing CSRF token." });
    }

    // Pass the token and the authenticated user's ID to the stateless verifier
    const isValid = verifyStatelessCsrfToken(req.user.id, clientToken);

    if (!isValid) {
        console.error(`[CSRF Error] Stateless validation failed - Method: ${req.method}, URL: ${req.url}`);
        return res.status(403).json({ success: false, message: "Invalid or expired CSRF token." });
    }

    // Sanitize transport fields before controllers see the body
    if (req.body) {
        delete req.body._csrf;
        delete req.body._method;
    }

    return next();
};
