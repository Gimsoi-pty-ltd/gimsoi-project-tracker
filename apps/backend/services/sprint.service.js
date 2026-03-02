import { StateTransitionError } from '../errors/BusinessErrors.js';

/**
 * Service to handle Sprint domain logic.
 * Note: Database models are currently stubbed awaiting schema rollout.
 */
export class SprintService {
    constructor(dbMock = null) {
        this.db = dbMock;
    }

    /**
     * Closes a sprint. Throws StateTransitionError if any task is still open.
     * @param {string} sprintId 
     */
    async closeSprint(sprintId) {
        // Stub retrieval since schema doesn't exist
        const tasks = this.db ? await this.db.task.findMany({ where: { sprintId } }) : [];

        const hasOpenTasks = tasks.some(task => task.status !== 'DONE' && task.status !== 'CLOSED');

        if (hasOpenTasks) {
            throw new StateTransitionError("Cannot close sprint with active open tasks remaining.");
        }

        if (this.db) {
            await this.db.sprint.update({
                where: { id: sprintId },
                data: { status: 'CLOSED' }
            });
        }

        return true;
    }

    /**
     * Updates a sprint's status safely.
     * @param {string} sprintId 
     * @param {string} currentStatus 
     * @param {string} targetStatus 
     */
    async updateSprintStatus(sprintId, currentStatus, targetStatus) {
        const validTransitions = {
            'PLANNING': ['ACTIVE', 'CANCELLED'],
            'ACTIVE': ['CLOSED', 'CANCELLED'],
            'CLOSED': [],
            'CANCELLED': []
        };

        const allowed = validTransitions[currentStatus] || [];
        if (!allowed.includes(targetStatus)) {
            throw new StateTransitionError(`Illegal sprint state transition from ${currentStatus} to ${targetStatus}`);
        }

        if (targetStatus === 'CLOSED') {
            return this.closeSprint(sprintId);
        }

        if (this.db) {
            await this.db.sprint.update({
                where: { id: sprintId },
                data: { status: targetStatus }
            });
        }

        return true;
    }
}
