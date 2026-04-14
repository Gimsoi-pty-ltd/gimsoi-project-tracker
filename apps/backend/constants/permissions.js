import ROLES from './roles.js';

/**
 * Permissions matrix defines which roles have access to specific actions.
 * 
 * DESIGN RATIONALE: This matrix is now local to the constants directory,
 * separating static configuration from the accessor logic in utils.
 */
export const PERMISSIONS = {
    [ROLES.ADMIN]: ['CREATE_TASK', 'UPDATE_TASK', 'UPDATE_ANY_TASK', 'DELETE_TASK', 'DELETE_OWN_TASK', 'VIEW_TASKS', 'VIEW_SPRINTS', 'MANAGE_PROJECTS', 'VIEW_CLIENTS', 'MANAGE_CLIENTS', 'VIEW_PROJECTS', 'MANAGE_SPRINTS'],
    [ROLES.PROJECT_MANAGER]: ['CREATE_TASK', 'UPDATE_TASK', 'UPDATE_ANY_TASK', 'DELETE_OWN_TASK', 'VIEW_TASKS', 'VIEW_SPRINTS', 'MANAGE_PROJECTS', 'VIEW_CLIENTS', 'MANAGE_CLIENTS', 'VIEW_PROJECTS', 'MANAGE_SPRINTS'],
    [ROLES.INTERN]: ['UPDATE_TASK', 'UPDATE_OWN_TASK_STATUS', 'DELETE_OWN_TASK', 'VIEW_TASKS', 'VIEW_SPRINTS', 'VIEW_CLIENTS', 'VIEW_PROJECTS'],
    [ROLES.CLIENT]: ['VIEW_TASKS', 'VIEW_SPRINTS', 'VIEW_CLIENTS', 'VIEW_PROJECTS']
};

export { hasPermission } from '../utils/hasPermission.js';
