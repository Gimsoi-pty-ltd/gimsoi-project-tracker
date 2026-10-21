import { randomUUID } from 'node:crypto';
import { test, expect } from '../fixtures/authFixtures.js';

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