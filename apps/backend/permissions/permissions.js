const ROLES = require('../Roles/roles');

/**
 * Permission Rules:
 * - PM: can create tasks
 * - Intern: can update tasks
 * - Client: can only view progress
 * - Admin: has full access
 */
const PERMISSIONS = {
    [ROLES.ADMIN]: ['CREATE_TASK', 'UPDATE_TASK', 'VIEW_PROGRESS'],
    [ROLES.PROJECT_MANAGER]: ['CREATE_TASK', 'VIEW_PROGRESS'],
    [ROLES.INTERN]: ['UPDATE_TASK', 'VIEW_PROGRESS'],
    [ROLES.CLIENT]: ['VIEW_PROGRESS']
};

/**
 * Helper to check if a role has a specific permission
 * @param {string} role 
 * @param {string} permission 
 * @returns {boolean}
 */
const hasPermission = (role, permission) => {
    if (!PERMISSIONS[role]) return false;
    return PERMISSIONS[role].includes(permission);
};

module.exports = {
    PERMISSIONS,
    hasPermission
};
