import jwt from "jsonwebtoken";

/**
 * Middleware that attempts to populate req.user from a JWT token,
 * but does NOT return 401 if the token is missing or invalid.
 */
export const populateUser = (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded) {
            req.user = {
                id: decoded.userId,
                role: decoded.role,
            };
        }
    } catch (error) {
        // Silently fail and continue without req.user
    }
    next();
};
