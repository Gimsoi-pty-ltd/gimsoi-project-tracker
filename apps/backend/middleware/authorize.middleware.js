import { hasPermission } from '../constants/permissions.js';

/**
 * Middleware to restrict access based on permissions.
 * @param {string | string[]} permissions - Single permission string or array of allowed permissions (OR logic)
 */
const authorize = (permissions) => {
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

    return (req, res, next) => {
        const userRole = req.user?.role;

        if (!userRole) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }

        const hasAccess = requiredPermissions.some(perm => hasPermission(userRole, perm));

        if (hasAccess) {
            next();
        } else {
            const permissionList = requiredPermissions.map(p => `'${p}'`).join(', ');
            const message = requiredPermissions.length === 1 
                ? `Access denied. Role '${userRole}' does not have ${permissionList} permission.`
                : `Access denied. Role '${userRole}' does not have any of the required permissions: ${permissionList}.`;

            res.status(403).json({
                success: false,
                message: message
            });
        }
    };
};

export default authorize;
