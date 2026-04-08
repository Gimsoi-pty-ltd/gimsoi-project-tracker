import { PERMISSIONS } from '../constants/permissions.js';

/**
 * Helper to check if a role has a specific permission.
 * Moved to utils/ to follow the repository's logic/data separation pattern.
 */
export const hasPermission = (role, permission) => {
    if (!PERMISSIONS[role]) return false;
    return PERMISSIONS[role].includes(permission);
};

export { PERMISSIONS };
