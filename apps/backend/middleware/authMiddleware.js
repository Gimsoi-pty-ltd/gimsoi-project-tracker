const { hasPermission } = require('../permissions/permissions');

/**
 * Middleware to restrict access based on permissions
 * @param {string} requiredPermission 
 */
const authorize = (requiredPermission) => {
    return (req, res, next) => {
        const userRole = req.headers['x-user-role'];

        if (!userRole) {
            return res.status(401).json({ error: 'Authentication required. Please provide x-user-role header.' });
        }

        if (hasPermission(userRole, requiredPermission)) {
            next();
        } else {
            res.status(403).json({
                error: `Access denied. Role '${userRole}' does not have '${requiredPermission}' permission.`
            });
        }
    };
};

module.exports = authorize;
