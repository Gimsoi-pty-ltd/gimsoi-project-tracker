import ROLES from './roles.js';

/**
 * Permissions matrix defines which roles have access to specific actions.
 * 
 * DESIGN RATIONALE: This matrix is now local to the constants directory,
 * separating static configuration from the accessor logic in utils.
 */
export const PERMISSIONS = {
    [ROLES.ADMIN]: [
        'CREATE_TASK', 'UPDATE_TASK', 'UPDATE_ANY_TASK', 'DELETE_TASK', 'DELETE_OWN_TASK',
        'VIEW_TASKS', 'VIEW_SPRINTS', 'MANAGE_PROJECTS', 'VIEW_CLIENTS', 'MANAGE_CLIENTS',
        'VIEW_PROJECTS', 'MANAGE_SPRINTS', 'MANAGE_USERS', 'VIEW_USERS',
        'MANAGE_PHASES', 'VIEW_PHASES', 'MANAGE_REPORTS', 'VIEW_REPORTS', 'VIEW_ANALYTICS', 'VIEW_PROGRESS'
    ],
    [ROLES.PROJECT_MANAGER]: [
        'CREATE_TASK', 'UPDATE_TASK', 'UPDATE_ANY_TASK', 'DELETE_OWN_TASK',
        'VIEW_TASKS', 'VIEW_SPRINTS', 'MANAGE_PROJECTS', 'VIEW_CLIENTS', 'MANAGE_CLIENTS',
        'VIEW_PROJECTS', 'MANAGE_SPRINTS',
        'MANAGE_PHASES', 'VIEW_PHASES', 'MANAGE_REPORTS', 'VIEW_REPORTS', 'VIEW_ANALYTICS', 'VIEW_PROGRESS'
    ],
    [ROLES.INTERN]: [
        'UPDATE_TASK', 'UPDATE_OWN_TASK_STATUS', 'DELETE_OWN_TASK',
        'VIEW_TASKS', 'VIEW_SPRINTS', 'VIEW_CLIENTS', 'VIEW_PROJECTS', 'VIEW_PHASES', 'VIEW_PROGRESS'
    ],
    [ROLES.CLIENT]: [
        'VIEW_TASKS', 'VIEW_SPRINTS', 'VIEW_CLIENTS', 'VIEW_PROJECTS', 'VIEW_PHASES', 'VIEW_PROGRESS'
    ]
};

export { hasPermission } from '../utils/hasPermission.js';
