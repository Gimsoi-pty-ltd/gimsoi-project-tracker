import { randomUUID } from 'node:crypto';
import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Projects API - authentication, authorisation, validation and errors', () => {

    // ---- Authentication (401) ----

    test('GET /api/projects without a token returns 401', async ({ request }) => {
        const response = await request.get('/api/projects');

        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('POST /api/projects without a token returns 401', async ({ request }) => {
        const response = await request.post('/api/projects', {
            data: { name: 'No Token Project', clientId: randomUUID() },
        });

        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    // ---- Authorisation (403) ----

    test('CLIENT role can view projects (read-only)', async ({ clientApi }) => {
        const response = await clientApi.get('/api/projects');

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
    });

    test('INTERN is forbidden from creating projects', async ({ internApi }) => {
        const response = await internApi.post('/api/projects', {
            data: { name: 'Intern Project', clientId: randomUUID() },
        });

        expect(response.status()).toBe(403);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('CLIENT is forbidden from creating projects', async ({ clientApi }) => {
        const response = await clientApi.post('/api/projects', {
            data: { name: 'Client Project', clientId: randomUUID() },
        });

        expect(response.status()).toBe(403);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    // ---- Validation (400) ----

    test('PM gets 400 when creating a project with an empty body', async ({ pmApi }) => {
        const response = await pmApi.post('/api/projects', { data: {} });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when clientId is not a valid UUID', async ({ pmApi }) => {
        const response = await pmApi.post('/api/projects', {
            data: { name: 'Bad Client Id', clientId: 'not-a-uuid' },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when the project name is empty', async ({ pmApi, testClient }) => {
        const response = await pmApi.post('/api/projects', {
            data: { name: '', clientId: testClient.id },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when updating a project without a version', async ({ pmApi, testProject }) => {
        const response = await pmApi.patch(`/api/projects/${testProject.id}`, {
            data: { name: 'Renamed Without Version' },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when an update contains only a version', async ({ pmApi, testProject }) => {
        const response = await pmApi.patch(`/api/projects/${testProject.id}`, {
            data: { version: testProject.version ?? 1 },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    // ---- Not found (404) ----

    test('PM gets 404 for an unknown project id', async ({ pmApi }) => {
        const response = await pmApi.get(`/api/projects/${randomUUID()}`);

        expect(response.status()).toBe(404);
        const body = await response.json();
        expect(body.success).toBe(false);
    });
});