const ROLE_PERMISSIONS = {
  ADMIN: [
    "CREATE_TASK", "UPDATE_TASK", "UPDATE_ANY_TASK", "DELETE_TASK", "DELETE_OWN_TASK",
    "VIEW_TASKS", "VIEW_SPRINTS", "MANAGE_PROJECTS", "VIEW_CLIENTS", "MANAGE_CLIENTS",
    "VIEW_PROJECTS", "MANAGE_SPRINTS", "MANAGE_USERS", "VIEW_USERS", "MANAGE_PHASES",
    "VIEW_PHASES", "MANAGE_REPORTS", "VIEW_REPORTS", "VIEW_ANALYTICS", "VIEW_PROGRESS",
  ],
  PM: [
    "CREATE_TASK", "UPDATE_TASK", "UPDATE_ANY_TASK", "DELETE_OWN_TASK", "VIEW_TASKS",
    "VIEW_SPRINTS", "MANAGE_PROJECTS", "VIEW_CLIENTS", "MANAGE_CLIENTS", "VIEW_PROJECTS",
    "MANAGE_SPRINTS", "MANAGE_PHASES", "VIEW_PHASES", "MANAGE_REPORTS", "VIEW_REPORTS",
    "VIEW_ANALYTICS", "VIEW_PROGRESS",
  ],
  INTERN: [
    "UPDATE_TASK", "UPDATE_OWN_TASK_STATUS", "DELETE_OWN_TASK", "VIEW_TASKS", "VIEW_SPRINTS",
    "VIEW_CLIENTS", "VIEW_PROJECTS", "VIEW_PHASES", "VIEW_PROGRESS",
  ],
  CLIENT: [
    "VIEW_TASKS", "VIEW_SPRINTS", "VIEW_CLIENTS", "VIEW_PROJECTS", "VIEW_PHASES", "VIEW_PROGRESS",
  ],
};

export const hasPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return Array.isArray(permission)
    ? permission.some((item) => permissions.includes(item))
    : permissions.includes(permission);
};

export const hasAnyPermission = (role, permissions) =>
  permissions.some((permission) => hasPermission(role, permission));