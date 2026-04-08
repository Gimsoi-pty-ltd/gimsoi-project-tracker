import { test, expect } from '../fixtures/authFixtures.js';
import prisma from '../../lib/prisma.js';

test.describe('Task Management - Core CRUD & Pipeline', () => {

    test('Create Active Task Inside Sprint', async ({ pmApi, testProject, testSprint }) => {
        const response = await pmApi.post('/api/tasks', {
            data: {
                title: "Deploy AI DB Update",
                projectId: testProject.id,
                sprintId: testSprint.id
            }
        });

        expect(response.status()).toBe(201);
        const json = await response.json();
        expect(json.data.status).toBe('TODO');
    });

    test('PM Completes Task lifecycle', async ({ pmApi, testProject, testSprint }) => {
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: "Task to complete", projectId: testProject.id, sprintId: testSprint.id }
        });
        const taskId = (await taskRes.json()).data.id;

        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: "IN_PROGRESS" } });
        await pmApi.patch(`/api/sprints/${testSprint.id}/status`, { data: { status: 'ACTIVE' } });

        const finishRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: "DONE" } });
        expect(finishRes.status()).toBe(200);
        expect((await finishRes.json()).data.status).toBe('DONE');
    });

    test('Partial update: send a PATCH request with only the priority field', async ({ pmApi, testProject, testSprint }) => {
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Baseline Title', projectId: testProject.id, sprintId: testSprint.id }
        });
        const taskId = (await taskRes.json()).data.id;

        const patchRes = await pmApi.patch(`/api/tasks/${taskId}`, {
            data: { priority: 'HIGH' }
        });
        expect(patchRes.status()).toBe(200);

        const body = await patchRes.json();
        expect(body.data.priority).toBe('HIGH');
        expect(body.data.title).toBe('Baseline Title');
    });

    test('Task creation/update inside a COMPLETED project is blocked (400)', async ({ pmApi, testClient }) => {
        const projRes = await pmApi.post('/api/projects', {
            data: { name: 'Completed Project', clientId: testClient.id }
        });
        const projectId = (await projRes.json()).data.id;
        await pmApi.patch(`/api/projects/${projectId}`, { data: { status: 'COMPLETED' } });

        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Illegal Task', projectId }
        });
        expect(taskRes.status()).toBe(400);
    });

    test.describe('GET /api/tasks/:id', () => {
        test('Happy path: an Admin or PM retrieves a valid task by id', async ({ pmApi, testProject, testSprint }) => {
            const taskRes = await pmApi.post('/api/tasks', {
                data: { title: 'GET Task Demo', projectId: testProject.id, sprintId: testSprint.id }
            });
            const taskId = (await taskRes.json()).data.id;

            const res = await pmApi.get(`/api/tasks/${taskId}`);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.data.id).toBe(taskId);
        });

        test('Not found: request a randomly generated UUID', async ({ pmApi }) => {
            const res = await pmApi.get('/api/tasks/123e4567-e89b-12d3-a456-426614174000');
            expect(res.status()).toBe(404);
        });
    });

    test.describe('Task Filtering & Summaries', () => {
        test('Project task summary returns correct status counts', async ({ pmApi, testProject, testSprint }) => {
            await pmApi.post('/api/tasks', { data: { title: 'T1', projectId: testProject.id, sprintId: testSprint.id } });
            const res = await pmApi.get(`/api/tasks/projects/${testProject.id}/summary`);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.data.TODO).toBeGreaterThan(0);
        });

        test('Filtering by status works correctly', async ({ pmApi, testProject }) => {
            const res = await pmApi.get(`/api/tasks?projectId=${testProject.id}&status=TODO`);
            expect(res.status()).toBe(200);
            const body = await res.json();
            body.data.forEach(t => expect(t.status).toBe('TODO'));
        });

        test('Pagination: nextCursor logic works', async ({ pmApi, testProject }) => {
            await pmApi.post('/api/tasks', { data: { title: 'P1', projectId: testProject.id } });
            await pmApi.post('/api/tasks', { data: { title: 'P2', projectId: testProject.id } });
            const res = await pmApi.get(`/api/tasks?projectId=${testProject.id}&limit=1`);
            const body = await res.json();
            expect(body.nextCursor).not.toBeNull();
        });
    });

    test.describe('Metadata Field: completedAt Tracking', () => {
        test('A newly created task has completedAt === null by default', async ({ pmApi, testProject }) => {
            const taskRes = await pmApi.post('/api/tasks', { data: { title: 'Null Test', projectId: testProject.id } });
            const task = (await taskRes.json()).data;
            expect(task.completedAt).toBeNull();
        });

        test('Transitioning a task to DONE sets completedAt automatically', async ({ pmApi, testProject, testSprint }) => {
            const taskRes = await pmApi.post('/api/tasks', { data: { title: 'Will Be Done', projectId: testProject.id, sprintId: testSprint.id } });
            const taskId = (await taskRes.json()).data.id;

            await pmApi.patch(`/api/sprints/${testSprint.id}/status`, { data: { status: 'ACTIVE' } });
            await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'IN_PROGRESS' } });
            await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'DONE' } });

            const dbTask = await prisma.task.findUnique({ where: { id: taskId } });
            expect(dbTask.completedAt).not.toBeNull();
        });

        test('non-status update does not affect completedAt', async ({ pmApi, testProject }) => {
            const taskRes = await pmApi.post('/api/tasks', { data: { title: 'Partial', projectId: testProject.id } });
            const taskId = (await taskRes.json()).data.id;
            await pmApi.patch(`/api/tasks/${taskId}`, { data: { title: 'Updated' } });
            const dbTask = await prisma.task.findUnique({ where: { id: taskId } });
            expect(dbTask.completedAt).toBeNull();
        });
    });
});
