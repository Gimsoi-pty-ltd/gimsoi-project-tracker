import { hasPermission } from '../constants/permissions.js';

/**
 * Middleware to restrict access based on permissions.
 * Reads the user role from req.userRole (set by verifyToken middleware)
 * with a fallback to x-user-role header for backward compatibility.
 * @param {string} requiredPermission 
 */
const authorize = (requiredPermission) => {
    return (req, res, next) => {
        const userRole = req.user?.role;

        if (!userRole) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }

        if (hasPermission(userRole, requiredPermission)) {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: `Access denied. Role '${userRole}' does not have '${requiredPermission}' permission.`
            });
        }
    };
};
export const authorizeEmployeeRecommendations = (req, res, next) => {
    const allowedRoles = ["ADMIN", "PM"];

    if (!req.user?.role) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: "Only administrators and project managers can access employee recommendations."
        });
    }

    next();
};
export default authorize;
