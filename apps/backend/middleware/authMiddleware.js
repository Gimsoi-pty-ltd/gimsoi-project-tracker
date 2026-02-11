import { hasPermission } from '../permissions/permissions.js';

/**
 * Middleware to restrict access based on permissions.
 * Reads the user role from req.userRole (set by verifyToken middleware)
 * with a fallback to x-user-role header for backward compatibility.
 * @param {string} requiredPermission 
 */
const authorize = (requiredPermission) => {
    return (req, res, next) => {
        const userRole = req.userRole || req.headers['x-user-role'];

        if (!userRole) {
            return res.status(401).json({ success: false, message: 'Authentication required. No role found in token or headers.' });
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

export default authorize;
