import ROLES from './roles.js';

/**
 * Permission matrix:
 * Convention: VIEW_ and MANAGE_ permissions (domain-wide access) are plural.
 *              CREATE_, UPDATE_, DELETE_ permissions (single-record actions) are singular.
 *
 * - ADMIN:  CREATE_TASK, UPDATE_TASK, DELETE_TASK, VIEW_TASKS, VIEW_SPRINTS, MANAGE_PROJECTS, VIEW_CLIENTS, MANAGE_CLIENTS, VIEW_PROJECTS, MANAGE_SPRINTS
 * - PM:     CREATE_TASK, UPDATE_TASK, VIEW_TASKS, VIEW_SPRINTS, MANAGE_PROJECTS, VIEW_CLIENTS, MANAGE_CLIENTS, VIEW_PROJECTS, MANAGE_SPRINTS
 * - INTERN: UPDATE_TASK, VIEW_TASKS, VIEW_SPRINTS, VIEW_CLIENTS, VIEW_PROJECTS
 * - CLIENT: VIEW_TASKS, VIEW_SPRINTS, VIEW_CLIENTS, VIEW_PROJECTS
 */
const PERMISSIONS = {
    [ROLES.ADMIN]: ['CREATE_TASK', 'UPDATE_TASK', 'DELETE_TASK', 'VIEW_TASKS', 'VIEW_SPRINTS', 'MANAGE_PROJECTS', 'VIEW_CLIENTS', 'MANAGE_CLIENTS', 'VIEW_PROJECTS', 'MANAGE_SPRINTS'],
    [ROLES.PROJECT_MANAGER]: ['CREATE_TASK', 'UPDATE_TASK', 'VIEW_TASKS', 'VIEW_SPRINTS', 'MANAGE_PROJECTS', 'VIEW_CLIENTS', 'MANAGE_CLIENTS', 'VIEW_PROJECTS', 'MANAGE_SPRINTS'],
    [ROLES.INTERN]: ['UPDATE_TASK', 'VIEW_TASKS', 'VIEW_SPRINTS', 'VIEW_CLIENTS', 'VIEW_PROJECTS'],
    [ROLES.CLIENT]: ['VIEW_TASKS', 'VIEW_SPRINTS', 'VIEW_CLIENTS', 'VIEW_PROJECTS']
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
