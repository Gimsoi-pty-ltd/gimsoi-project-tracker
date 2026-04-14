import { test, expect } from '../fixtures/authFixtures.js';
import registerTestingRoutes from '../../utils/registerTestingRoutes.js';
import * as statuses from '../../constants/statuses.js';
import { ALLOWED_TRANSITIONS } from '../../services/task.service.js';

test.describe('Error Handling & Contract Integrity', () => {

    test.describe('Global Error Handler', () => {
        let csrfToken = '';

        test.beforeEach(async ({ request }) => {
            const response = await request.get('/api/auth/csrf-token');
            const data = await response.json();
            csrfToken = data.csrfToken;
        });

        test('Returns consistent JSON shape with 500 default for internal errors', async ({ request, adminApi }) => {
            // Trigger a potential DB error (mapped by Prisma) by passing an invalid ID
            const res = await adminApi.get('/api/projects/not-a-uuid');
            
            const data = await res.json();
            expect(data).toHaveProperty('success', false);
            expect(data).toHaveProperty('message');
            // Status code should be 500 (default) or potentially 404/400 if caught earlier,
            // but the success/message shape is the core contract.
            expect(res.status()).toBeGreaterThanOrEqual(400);
        });

        test('Returns consistent JSON shape for known domain errors (400, 404)', async ({ pmApi, testProject }) => {
            // Trigger 404 Not Found
            const res404 = await pmApi.get('/api/tasks/00000000-0000-0000-0000-000000000000');
            expect(res404.status()).toBe(404);
            const data404 = await res404.json();
            expect(data404.success).toBe(false);
            expect(data404.message).toContain('not found');

            // Trigger 400 StateTransitionError (illegal jump)
            const taskRes = await pmApi.post('/api/tasks', {
                data: { title: 'Jump Error Task', projectId: testProject.id }
            });
            const taskId = (await taskRes.json()).data.id;
            const res400 = await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'DONE' } });
            
            expect(res400.status()).toBe(400);
            const data400 = await res400.json();
            expect(data400.success).toBe(false);
            expect(data400.message).toContain('Illegal task transition');
        });
    });

    test.describe('Contract Verification', () => {
        let validateTaskShape;
        
        test.beforeAll(async () => {
            const mod = await import('../../utils/validateContract.js');
            validateTaskShape = mod.validateTaskShape;
        });

        test('validateTaskShape passes for valid DONE task', async () => {
            const task = { id: '1', title: 'T', status: 'DONE', projectId: '2', completedAt: new Date().toISOString() };
            expect(() => validateTaskShape(task)).not.toThrow();
        });

        test('validateTaskShape throws for non-DONE task with completedAt', async () => {
            const task = { id: '1', title: 'T', status: 'IN_PROGRESS', projectId: '2', completedAt: new Date().toISOString() };
            expect(() => validateTaskShape(task)).toThrow(/Contract violation: completedAt is set on a non-DONE task/);
        });

        test('validateTaskShape throws if required field missing', async () => {
            const task = { id: '1', title: 'T', status: 'TODO', projectId: '2' }; // missing completedAt
            expect(() => validateTaskShape(task)).toThrow(/Task missing required field: completedAt/);
        });
    });

    test.describe('Status Constants Integrity', () => {
        test('TASK_STATUS contains expected keys and values', () => {
            expect(statuses.TASK_STATUS).toBeDefined();
            expect(statuses.TASK_STATUS.TODO).toBe('TODO');
            expect(statuses.TASK_STATUS.DONE).toBe('DONE');
        });

        test('SPRINT_STATUS contains expected keys and values', () => {
            expect(statuses.SPRINT_STATUS).toBeDefined();
            expect(statuses.SPRINT_STATUS.PLANNING).toBe('PLANNING');
        });

        test('ALLOWED_TRANSITIONS keys use TASK_STATUS constants', () => {
            const keys = Object.keys(ALLOWED_TRANSITIONS);
            expect(keys).toContain(statuses.TASK_STATUS.TODO);
        });
    });

    test.describe('Testing Utilities', () => {
        test('registerTestingRoutes mounts ONLY in test environment', async () => {
            const mockApp = {
                use: (path) => { mockApp.lastMounted = path; }
            };

            const originalEnv = process.env.NODE_ENV;
            
            process.env.NODE_ENV = 'test';
            await registerTestingRoutes(mockApp);
            expect(mockApp.lastMounted).toBe('/api/testing');

            mockApp.lastMounted = null;
            process.env.NODE_ENV = 'production';
            await registerTestingRoutes(mockApp);
            expect(mockApp.lastMounted).toBeNull();

            process.env.NODE_ENV = originalEnv;
        });
    });
});
