import { test, expect } from '@playwright/test';
import { SprintService } from '../../services/sprint.service.js';
import { StateTransitionError } from '../../src/errors/BusinessErrors.js';

test.describe('SprintService Domain Rules', () => {

    let mockDb;
    let service;

    test.beforeEach(() => {
        mockDb = {
            task: { findMany: async () => [] },
            sprint: { update: async () => { } }
        };
        service = new SprintService(mockDb);
    });

    test('closeSprint throws StateTransitionError when tasks are open', async () => {
        mockDb.task.findMany = async () => [{ id: 1, status: 'IN_PROGRESS' }];

        await expect(service.closeSprint('sprint-123')).rejects.toThrow(StateTransitionError);
    });

    test('closeSprint tracks DB.update exactly once when tasks are finalized', async () => {
        mockDb.task.findMany = async () => [{ id: 1, status: 'DONE' }, { id: 2, status: 'CLOSED' }];

        let updateCalled = false;
        let targetId = null;
        let payloadStatus = null;

        mockDb.sprint.update = async (args) => {
            updateCalled = true;
            targetId = args.where.id;
            payloadStatus = args.data.status;
        };

        await service.closeSprint('sprint-123');

        expect(updateCalled).toBe(true);
        expect(targetId).toBe('sprint-123');
        expect(payloadStatus).toBe('CLOSED');
    });

    test('updateSprintStatus strictly throws StateTransitionError on illegal moves', async () => {
        await expect(service.updateSprintStatus('sprint-123', 'CLOSED', 'ACTIVE')).rejects.toThrow(StateTransitionError);
        await expect(service.updateSprintStatus('sprint-123', 'PLANNING', 'CLOSED')).rejects.toThrow(StateTransitionError);
    });
});
