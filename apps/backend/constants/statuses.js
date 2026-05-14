/**
 * Status constants for Tasks, Sprints, and Projects.
 * These constants are the single source of truth for the backend status field.
 * 
 * @see {@link docs/DATA_CONTRACT.md} for the authoritative analytical data contract.
 */

export const TASK_STATUS = {
    TODO:        'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    BLOCKED:     'BLOCKED',
    DONE:        'DONE',
    CANCELLED:   'CANCELLED'
};

export const SPRINT_STATUS = {
    PLANNING: 'PLANNING',
    ACTIVE:   'ACTIVE',
    CLOSED:   'CLOSED'
};

export const PROJECT_STATUS = {
    DRAFT:     'DRAFT',
    ACTIVE:    'ACTIVE',
    COMPLETED: 'COMPLETED'
};
