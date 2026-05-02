import { test, expect } from '../fixtures/authFixtures.js';
import * as taskService from '../../services/task.service.js';
import prisma from '../../lib/prisma.js';

test.describe('Task Lifecycle & Transition Guards', () => {

    test.describe('Structural Implementation Details', () => {
        test('assertNoImmutableFields is NOT exported from task.service.js', () => {
            expect(taskService.assertNoImmutableFields).toBeUndefined();
        });

        test('assertValidTransition is NOT exported from task.service.js', () => {
            expect(taskService.assertValidTransition).toBeUndefined();
        });

        test('assertSprintAllowsDone is NOT exported from task.service.js', () => {
            expect(taskService.assertSprintAllowsDone).toBeUndefined();
        });
    });

    test.describe('State Machine & Validation Rules', () => {
        const { ALLOWED_TRANSITIONS } = taskService;

        test('Contract: ALLOWED_TRANSITIONS is defined and is an object', async () => {
            expect(ALLOWED_TRANSITIONS).toBeDefined();
            expect(typeof ALLOWED_TRANSITIONS).toBe('object');
            expect(ALLOWED_TRANSITIONS.TODO).toContain('IN_PROGRESS');
        });

        test('Baseline: ALLOWED_TRANSITIONS is enforced (regression test)', async ({ pmApi, testProject, testSprint }) => {
            const taskRes = await pmApi.post('/api/tasks', {
                data: { title: 'Transition Baseline Task', projectId: testProject.id, sprintId: testSprint.id }
            });
            const task = (await taskRes.json()).data;
            const validRes = await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'IN_PROGRESS', version: task.version } });
            expect(validRes.status()).toBe(200);
        });

        test('Illegal transition: DONE -> IN_PROGRESS is blocked', async ({ pmApi, testProject, testSprint }) => {
            const taskRes = await pmApi.post('/api/tasks', {
                data: { title: 'Illegal Regression Task', projectId: testProject.id, sprintId: testSprint.id }
            });
            let task = (await taskRes.json()).data;

            const res1 = await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'IN_PROGRESS', version: task.version } });
            task = (await res1.json()).data;

            await pmApi.patch(`/api/sprints/${testSprint.id}/status`, { data: { status: 'ACTIVE', version: testSprint.version } });

            const res2 = await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'DONE', version: task.version } });
            task = (await res2.json()).data;

            const failRes = await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'IN_PROGRESS', version: task.version } });
            expect(failRes.status()).toBe(400);
            expect((await failRes.json()).message).toContain('Cannot modify');
        });

        test('DONE task rejects non-status field modification (title update blocked)', async ({ pmApi, testProject, testSprint }) => {
            const taskRes = await pmApi.post('/api/tasks', {
                data: { title: 'Immutable Done Task', projectId: testProject.id, sprintId: testSprint.id }
            });
            let task = (await taskRes.json()).data;
            
            // Setup: Reach DONE state correctly
            const r1 = await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'IN_PROGRESS', version: task.version } });
            task = (await r1.json()).data;

            await pmApi.patch(`/api/sprints/${testSprint.id}/status`, { data: { status: 'ACTIVE', version: testSprint.version } });

            const r2 = await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'DONE', version: task.version } });
            task = (await r2.json()).data;

            // Action: Attempt non-status update (title)
            const failRes = await pmApi.patch(`/api/tasks/${task.id}`, {
                data: { title: 'Attempting to modify a done task', version: task.version }
            });

            expect(failRes.status()).toBe(400);
            const json = await failRes.json();
            expect(typeof json.message).toBe('string');
            expect(json.message.length).toBeGreaterThan(0);
        });

        test('Illegal transition: TODO -> DONE is blocked (jumps IN_PROGRESS)', async ({ pmApi, testProject, testSprint }) => {
            const taskRes = await pmApi.post('/api/tasks', {
                data: { title: 'Jump Task', projectId: testProject.id, sprintId: testSprint.id }
            });
            const task = (await taskRes.json()).data;
            const failRes = await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'DONE', version: task.version } });
            expect(failRes.status()).toBe(400);
            expect((await failRes.json()).message).toContain('Illegal task transition');
        });

        test('Valid transition: TODO -> CANCELLED', async ({ pmApi, testProject, testSprint }) => {
            const taskRes = await pmApi.post('/api/tasks', {
                data: { title: 'Cancel from TODO', projectId: testProject.id, sprintId: testSprint.id }
            });
            const task = (await taskRes.json()).data;
            const res = await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'CANCELLED', version: task.version } });
            expect(res.status()).toBe(200);
        });

        test('Valid transition: IN_PROGRESS -> BLOCKED', async ({ pmApi, testProject, testSprint }) => {
            const taskRes = await pmApi.post('/api/tasks', {
                data: { title: 'To Block', projectId: testProject.id, sprintId: testSprint.id }
            });
            let task = (await taskRes.json()).data;
            const r1 = await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'IN_PROGRESS', version: task.version } });
            task = (await r1.json()).data;
            const res = await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'BLOCKED', version: task.version } });
            expect(res.status()).toBe(200);
            expect((await res.json()).data.status).toBe('BLOCKED');
        });

        test('Reversibility: BLOCKED -> IN_PROGRESS', async ({ pmApi, testProject, testSprint }) => {
            const taskRes = await pmApi.post('/api/tasks', {
                data: { title: 'Unblock', projectId: testProject.id, sprintId: testSprint.id }
            });
            let task = (await taskRes.json()).data;
            const r1 = await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'IN_PROGRESS', version: task.version } });
            task = (await r1.json()).data;
            const r2 = await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'BLOCKED', version: task.version } });
            task = (await r2.json()).data;
            const res = await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'IN_PROGRESS', version: task.version } });
            expect(res.status()).toBe(200);
        });
    });

    test.describe('Contextual & Data Guards', () => {
        test('rejects completedAt in update payload (Service-level immutability check)', async ({ adminApi, testProject }) => {
            const taskRes = await adminApi.post('/api/tasks', {
                data: { title: 'Immutable Guard Task', projectId: testProject.id }
            });
            const taskId = (await taskRes.json()).data.id;
            await expect(
                taskService.updateTask(taskId, { completedAt: new Date() }, null, 'ADMIN')
            ).rejects.toThrow('completedAt cannot be set manually');
        });

        test('rejects unknown status (FLYING) returning 400', async ({ adminApi, testProject }) => {
            const taskRes = await adminApi.post('/api/tasks', {
                data: { title: 'Bad Status Task', projectId: testProject.id }
            });
            const task = (await taskRes.json()).data;
            const res = await adminApi.patch(`/api/tasks/${task.id}`, { data: { status: 'FLYING', version: task.version } });
            expect(res.status()).toBe(400);
        });

        test('Updating a task on a COMPLETED project is blocked', async ({ pmApi, testClient }) => {
            const projRes = await pmApi.post('/api/projects', {
                data: { name: 'Guard Project', clientId: testClient.id }
            });
            const project = (await projRes.json()).data;
            const projectId = project.id;
            const res1 = await pmApi.patch(`/api/projects/${projectId}`, { data: { status: 'ACTIVE', version: project.version } });
            const p1 = (await res1.json()).data;
            
            const taskRes = await pmApi.post('/api/tasks', {
                data: { title: 'Guard Task', projectId }
            });
            const task = (await taskRes.json()).data;
            const taskId = task.id;

            // Complete the project
            await pmApi.patch(`/api/projects/${projectId}`, { data: { status: 'COMPLETED', version: p1.version } });

            const editRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { title: 'Updated', version: task.version } });
            expect(editRes.status()).toBe(400);
            expect((await editRes.json()).message).toContain('COMPLETED');
        });

        test('Transitioning to DONE requires an ACTIVE sprint', async ({ pmApi, testProject }) => {
            const sprintRes = await pmApi.post('/api/sprints', {
                data: { name: 'Planning Sprint', projectId: testProject.id }
            });
            const sprint = (await sprintRes.json()).data;
            const sprintId = sprint.id;
            const taskRes = await pmApi.post('/api/tasks', {
                data: { title: 'To DONE', projectId: testProject.id, sprintId }
            });
            const task = (await taskRes.json()).data;
            const taskId = task.id;
            await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'IN_PROGRESS', version: task.version } });
            // Note: sprint is still PLANNING, not ACTIVE.
            const doneRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'DONE', version: task.version + 1 } });
            expect(doneRes.status()).toBe(400);
            expect((await doneRes.json()).message.toLowerCase()).toContain('active sprint');
        });
    });
});

test.describe('Task Deletion — Ownership-Gated Access', () => {

    test('PM can delete a task they created (Reporter ownership)', async ({ pmApi, testProject, testSprint }) => {
        // Setup: PM creates a task
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'PM Own Task', projectId: testProject.id, sprintId: testSprint.id }
        });
        const task = (await taskRes.json()).data;

        // Action: PM deletes
        const res = await pmApi.delete(`/api/tasks/${task.id}`);
        expect(res.status()).toBe(204);

        // Verify: Check no longer exists
        const checkRes = await pmApi.get(`/api/tasks/${task.id}`);
        expect(checkRes.status()).toBe(404);
    });

    test('INTERN can delete a task they created (Reporter ownership)', async ({ internApi, testProject, testSprint }) => {
        // Setup: Intern cannot create tasks directly (matrix), so we use Prisma to set reporterId
        const authRes = await internApi.get('/api/auth/check-auth');
        const internUser = (await authRes.json()).user;

        const task = await prisma.task.create({
            data: { 
                title: 'Intern Task', 
                projectId: testProject.id, 
                sprintId: testSprint.id, 
                reporterId: internUser.id,
                status: 'TODO'
            }
        });

        // Action: Intern deletes
        const res = await internApi.delete(`/api/tasks/${task.id}`);
        expect(res.status()).toBe(204);
    });

    test('PM cannot delete a task created by someone else (Sad Path)', async ({ adminApi, pmApi, testProject, testSprint }) => {
        // Setup: Admin creates task (PM is NOT reporter)
        const taskRes = await adminApi.post('/api/tasks', {
            data: { title: 'Admin Task', projectId: testProject.id, sprintId: testSprint.id }
        });
        const task = (await taskRes.json()).data;

        // Action: PM attempts delete
        const res = await pmApi.delete(`/api/tasks/${task.id}`);
        expect(res.status()).toBe(403);
        const json = await res.json();
        expect(json.message).toContain('do not have permission');
    });

    test('INTERN cannot delete a task created by someone else (Sad Path)', async ({ adminApi, internApi, testProject, testSprint }) => {
        // Setup: Admin creates task
        const taskRes = await adminApi.post('/api/tasks', {
            data: { title: 'Another Admin Task', projectId: testProject.id, sprintId: testSprint.id }
        });
        const task = (await taskRes.json()).data;

        // Action: Intern attempts delete
        const res = await internApi.delete(`/api/tasks/${task.id}`);
        expect(res.status()).toBe(403);
        const json = await res.json();
        expect(json.message).toContain('do not have permission');
    });

    test('CLIENT still cannot delete any task (Route Gate)', async ({ adminApi, clientApi, testProject, testSprint }) => {
        // Setup: Admin creates task
        const taskRes = await adminApi.post('/api/tasks', {
            data: { title: 'Client Target Task', projectId: testProject.id, sprintId: testSprint.id }
        });
        const task = (await taskRes.json()).data;

        // Action: Client attempts delete
        const res = await clientApi.delete(`/api/tasks/${task.id}`);
        expect(res.status()).toBe(403); // Strictly from route gate
    });
});
