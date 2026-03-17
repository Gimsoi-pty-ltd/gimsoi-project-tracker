/**
 * Centralized state transition mappings for all primary entities.
 * Defines the strict directional state machines governing lifecycles.
 */

/**
 * PROJECT_TRANSITIONS
 * POLICY-PENDING: team must decide if a COMPLETED project can revert to ACTIVE.
 * Currently permitted. Remove 'ACTIVE' here to permanently block regression.
 */
export const PROJECT_TRANSITIONS = {
  'DRAFT': ['ACTIVE', 'COMPLETED'],
  'ACTIVE': ['COMPLETED', 'DRAFT'],
  'COMPLETED': ['ACTIVE']
};

/**
 * SPRINT_TRANSITIONS
 * POLICY-PENDING: team must decide if a CLOSED sprint can be reopened.
 * Currently explicitly locked: 'CLOSED' maps to empty array to enforce regression lock.
 */
export const SPRINT_TRANSITIONS = {
  'PLANNING': ['ACTIVE'],
  'ACTIVE': ['CLOSED'],
  'CLOSED': []
};

/**
 * TASK_TRANSITIONS
 * Directional state machine for tasks.
 * Defines a strict left-to-right progression: TODO -> IN_PROGRESS -> DONE.
 */
export const TASK_TRANSITIONS = {
  'TODO':        ['IN_PROGRESS'],
  'IN_PROGRESS': ['DONE'],
  'DONE':        []
};
