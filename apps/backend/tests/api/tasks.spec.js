import { test, expect } from '../fixtures/authFixtures.js';
import prisma from '../../lib/prisma.js';

test.describe('Task Management - Core CRUD & Pipeline', () => {

    test('Create Active Task Inside Sprint', async ({ pmApi, testProject, testSprint }) => {
        const response = await pmApi.post('/api/tasks', {
            data: {
                title: "Deploy AI DB Update",
                projectId: testProject.id,
                sprintId: testSprint.id,
                storyPoints: 5
            }
        });

        expect(response.status()).toBe(201);
        const json = await response.json();
        expect(json.data.status).toBe('TODO');
        expect(json.data.storyPoints).toBe(5);
    });

    test('PM Completes Task lifecycle', async ({ pmApi, testProject, testSprint }) => {
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: "Task to complete", projectId: testProject.id, sprintId: testSprint.id }
        });
        let task = (await taskRes.json()).data;
        const taskId = task.id;

        const sprintRes = await pmApi.get(`/api/sprints?projectId=${testProject.id}`);
        const sprint = (await sprintRes.json()).data[0];

        const p1 = await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: "IN_PROGRESS", version: task.version } });
        task = (await p1.json()).data;

        // Always attempt activation; accept 200 (new) or 409/400 (already active) as valid states.
        const activationAttempt = await pmApi.patch(`/api/sprints/${testSprint.id}/status`, {
            data: { status: 'ACTIVE', version: sprint.version }
        });
        // We need the sprint ACTIVE regardless — fetch its fresh state to confirm.
        const freshSprintRes = await pmApi.get(`/api/sprints?projectId=${testProject.id}`);
        const freshSprint = (await freshSprintRes.json()).data.find(s => s.id === testSprint.id);
        expect(freshSprint.status).toBe('ACTIVE');

        const finishRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: "DONE", version: task.version } });
        if (finishRes.status() !== 200) throw new Error(await finishRes.text());
        expect(finishRes.status()).toBe(200);
        expect((await finishRes.json()).data.status).toBe('DONE');
    });

    test('Partial update: send a PATCH request with storyPoints', async ({ pmApi, testProject, testSprint }) => {
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Baseline Title', projectId: testProject.id, sprintId: testSprint.id }
        });
        const task = (await taskRes.json()).data;
        const taskId = task.id;

        const patchRes = await pmApi.patch(`/api/tasks/${taskId}`, {
            data: { storyPoints: 8, version: task.version }
        });
        expect(patchRes.status()).toBe(200);

        const body = await patchRes.json();
        expect(body.data.storyPoints).toBe(8);
        expect(body.data.title).toBe('Baseline Title');
    });

    test('Task creation/update inside a COMPLETED project is blocked (400)', async ({ pmApi, testClient }) => {
        const projRes = await pmApi.post('/api/projects', {
            data: { name: 'Completed Project', clientId: testClient.id }
        });
        const project = (await projRes.json()).data;
        const projectId = project.id;
        await pmApi.patch(`/api/projects/${projectId}`, { data: { status: 'COMPLETED', version: project.version } });

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
            let task = (await taskRes.json()).data;
            const taskId = task.id;

            const sprintRes = await pmApi.get(`/api/sprints?projectId=${testProject.id}`);
            const sprint = (await sprintRes.json()).data[0];

            // Always attempt activation; accept 200 (new) or 409/400 (already active) as valid states.
            const activationAttempt = await pmApi.patch(`/api/sprints/${testSprint.id}/status`, {
                data: { status: 'ACTIVE', version: sprint.version }
            });
            const freshSprintRes = await pmApi.get(`/api/sprints?projectId=${testProject.id}`);
            const freshSprint = (await freshSprintRes.json()).data.find(s => s.id === testSprint.id);
            expect(freshSprint.status).toBe('ACTIVE');
            const p1 = await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'IN_PROGRESS', version: task.version } });
            task = (await p1.json()).data;
            const res2 = await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'DONE', version: task.version } });
            if (res2.status() !== 200) console.error(await res2.text());

            const dbTask = await prisma.task.findUnique({ where: { id: taskId } });
            expect(dbTask.completedAt).not.toBeNull();
        });

        test('non-status update does not affect completedAt', async ({ pmApi, testProject }) => {
            const taskRes = await pmApi.post('/api/tasks', { data: { title: 'Partial', projectId: testProject.id } });
            const task = (await taskRes.json()).data;
            const taskId = task.id;
            await pmApi.patch(`/api/tasks/${taskId}`, { data: { title: 'Updated', version: task.version } });
            const dbTask = await prisma.task.findUnique({ where: { id: taskId } });
            expect(dbTask.completedAt).toBeNull();
        });
    });
});

// Added for Task 8: negative-path tests (authentication, role, validation, not found).
const randomUUID = () => globalThis.crypto.randomUUID();

test.describe('Tasks API - authentication, authorisation, validation and errors', () => {

    // ---- Authentication (401) ----

    test('GET /api/tasks without a token returns 401', async ({ request }) => {
        const response = await request.get('/api/tasks');

        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('POST /api/tasks without a token returns 401', async ({ request }) => {
        const response = await request.post('/api/tasks', {
            data: { title: 'No Token Task', projectId: randomUUID() },
        });

        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PATCH /api/tasks/:id without a token returns 401', async ({ request }) => {
        const response = await request.patch(`/api/tasks/${randomUUID()}`, {
            data: { title: 'No Token Update', version: 1 },
        });

        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('DELETE /api/tasks/:id without a token returns 401', async ({ request }) => {
        const response = await request.delete(`/api/tasks/${randomUUID()}`);

        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('GET task summary without a token returns 401', async ({ request }) => {
        const response = await request.get(`/api/tasks/projects/${randomUUID()}/summary`);

        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    // ---- Authorisation (403) ----

    test('CLIENT is forbidden from creating tasks', async ({ clientApi }) => {
        const response = await clientApi.post('/api/tasks', {
            data: { title: 'Client Task', projectId: randomUUID() },
        });

        expect(response.status()).toBe(403);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('CLIENT is forbidden from updating tasks', async ({ clientApi }) => {
        const response = await clientApi.patch(`/api/tasks/${randomUUID()}`, {
            data: { title: 'Client Update', version: 1 },
        });

        expect(response.status()).toBe(403);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    // ---- Validation (400): create ----

    test('PM gets 400 when creating a task with an empty body', async ({ pmApi }) => {
        const response = await pmApi.post('/api/tasks', { data: {} });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when the task title is empty', async ({ pmApi, testProject }) => {
        const response = await pmApi.post('/api/tasks', {
            data: { title: '', projectId: testProject.id },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when the task title is longer than 200 characters', async ({ pmApi, testProject }) => {
        const response = await pmApi.post('/api/tasks', {
            data: { title: 'a'.repeat(201), projectId: testProject.id },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when projectId is not a valid UUID', async ({ pmApi }) => {
        const response = await pmApi.post('/api/tasks', {
            data: { title: 'Bad Project Id', projectId: 'not-a-uuid' },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when priority is not a valid value', async ({ pmApi, testProject }) => {
        const response = await pmApi.post('/api/tasks', {
            data: { title: 'Bad Priority', projectId: testProject.id, priority: 'EXTREME' },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when storyPoints is not an integer', async ({ pmApi, testProject }) => {
        const response = await pmApi.post('/api/tasks', {
            data: { title: 'Bad Points', projectId: testProject.id, storyPoints: 1.5 },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    // ---- Validation (400): update ----
    // Validation runs before the service, so a random task id is enough here.

    test('PM gets 400 when updating a task without a version', async ({ pmApi }) => {
        const response = await pmApi.patch(`/api/tasks/${randomUUID()}`, {
            data: { title: 'Renamed Without Version' },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when an update contains only a version', async ({ pmApi }) => {
        const response = await pmApi.patch(`/api/tasks/${randomUUID()}`, {
            data: { version: 1 },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when updating a task with an invalid priority', async ({ pmApi }) => {
        const response = await pmApi.patch(`/api/tasks/${randomUUID()}`, {
            data: { priority: 'EXTREME', version: 1 },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    // ---- Validation (400): list filters ----

    test('GET /api/tasks with an invalid status filter returns 400', async ({ pmApi }) => {
        const response = await pmApi.get('/api/tasks?status=FLYING');

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('GET /api/tasks with a non-UUID projectId returns 400', async ({ pmApi }) => {
        const response = await pmApi.get('/api/tasks?projectId=not-a-uuid');

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('GET /api/tasks with an invalid sortBy returns 400', async ({ pmApi }) => {
        const response = await pmApi.get('/api/tasks?sortBy=banana');

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    // ---- Not found (404): assumptions about the service, verify if these fail ----

    test('PM gets 404 when updating an unknown task id', async ({ pmApi }) => {
        const response = await pmApi.patch(`/api/tasks/${randomUUID()}`, {
            data: { title: 'Ghost Task', version: 1 },
        });

        expect(response.status()).toBe(404);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 404 when deleting an unknown task id', async ({ pmApi }) => {
        const response = await pmApi.delete(`/api/tasks/${randomUUID()}`);

        expect(response.status()).toBe(404);
    });
});
