import { randomUUID } from 'node:crypto';
import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Sprints API - authentication, authorisation, validation and errors', () => {

    // ---- Authentication (401) ----

    test('GET /api/sprints without a token returns 401', async ({ request }) => {
        const response = await request.get('/api/sprints');

        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('POST /api/sprints without a token returns 401', async ({ request }) => {
        const response = await request.post('/api/sprints', {
            data: { name: 'No Token Sprint', projectId: randomUUID() },
        });

        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    // ---- Authorisation (403) ----

        test('CLIENT role can view sprints of a project (read-only)', async ({ clientApi, testProject }) => {
        const response = await clientApi.get(`/api/sprints?projectId=${testProject.id}`);

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
    });

    test('GET /api/sprints without projectId returns 400', async ({ pmApi }) => {
        const response = await pmApi.get('/api/sprints');

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
        expect(body.message).toContain('projectId');
    });
    test('INTERN is forbidden from creating sprints', async ({ internApi }) => {
        const response = await internApi.post('/api/sprints', {
            data: { name: 'Intern Sprint', projectId: randomUUID() },
        });

        expect(response.status()).toBe(403);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('CLIENT is forbidden from creating sprints', async ({ clientApi }) => {
        const response = await clientApi.post('/api/sprints', {
            data: { name: 'Client Sprint', projectId: randomUUID() },
        });

        expect(response.status()).toBe(403);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    // ---- Validation (400) ----

    test('PM gets 400 when creating a sprint with an empty body', async ({ pmApi }) => {
        const response = await pmApi.post('/api/sprints', { data: {} });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when projectId is not a valid UUID', async ({ pmApi }) => {
        const response = await pmApi.post('/api/sprints', {
            data: { name: 'Bad Project Id', projectId: 'not-a-uuid' },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when the sprint name is empty', async ({ pmApi, testProject }) => {
        const response = await pmApi.post('/api/sprints', {
            data: { name: '', projectId: testProject.id },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when the sprint status is not a valid value', async ({ pmApi, testSprint }) => {
        const response = await pmApi.patch(`/api/sprints/${testSprint.id}/status`, {
            data: { status: 'FLYING', version: testSprint.version ?? 1 },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when changing sprint status without a version', async ({ pmApi, testSprint }) => {
        const response = await pmApi.patch(`/api/sprints/${testSprint.id}/status`, {
            data: { status: 'ACTIVE' },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });
});