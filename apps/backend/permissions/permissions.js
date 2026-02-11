import ROLES from '../Roles/roles.js';

/**
 * Permission matrix:
 * - ADMIN:  CREATE_TASK, UPDATE_TASK, DELETE_TASK, VIEW_PROGRESS
 * - PM:     CREATE_TASK, VIEW_PROGRESS
 * - INTERN: UPDATE_TASK, VIEW_PROGRESS
 * - CLIENT: VIEW_PROGRESS
 */
const PERMISSIONS = {
    [ROLES.ADMIN]: ['CREATE_TASK', 'UPDATE_TASK', 'DELETE_TASK', 'VIEW_PROGRESS'],
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
export const hasPermission = (role, permission) => {
    if (!PERMISSIONS[role]) return false;
    return PERMISSIONS[role].includes(permission);
};

export { PERMISSIONS };
