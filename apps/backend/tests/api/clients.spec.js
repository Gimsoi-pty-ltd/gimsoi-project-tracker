import { randomUUID } from 'node:crypto';
import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Client API Validation', () => {
    test('ADMIN can successfully create a new Client', async ({ adminApi }) => {
        const response = await adminApi.post('/api/clients', {
            data: {
                name: `Playwright Test Client ${Date.now()}`,
                contactEmail: `playwright.test.${Date.now()}@example.com`
            }
        });

        expect(response.status()).toBe(201);
        const json = await response.json();
        expect(json.data.id).toBeDefined();
    });

    test('INTERN is forbidden from creating Clients', async ({ internApi }) => {
        const response = await internApi.post('/api/clients', {
            data: {
                name: 'Hacked Client',
                contactEmail: 'hack@example.com'
            }
        });

        expect(response.status()).toBe(403);
    });

    test('ADMIN can update a Client with versioning', async ({ adminApi }) => {
        const createRes = await adminApi.post('/api/clients', {
            data: {
                name: 'Update Test Client',
                contactEmail: 'update@test.com'
            }
        });

        const client = (await createRes.json()).data;

        const response = await adminApi.patch(`/api/clients/${client.id}`, {
            data: {
                name: 'Updated Client Name',
                version: client.version
            }
        });

        expect(response.status()).toBe(200);
        const json = await response.json();
        expect(json.data.name).toBe('Updated Client Name');
    });
});

test.describe('Clients API - authentication, authorisation, validation and errors', () => {
    // Authentication (401)

    test('GET /api/clients without a token returns 401', async ({ request }) => {
        const response = await request.get('/api/clients');

        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.success).toBe(false);
        expect(body.message).toContain('Unauthorized');
    });

    test('GET /api/clients with a malformed token returns 401', async ({ request }) => {
        const response = await request.get('/api/clients', {
            headers: { Authorization: 'Bearer not-a-real-token' }
        });

        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('POST /api/clients without a token returns 401', async ({ request }) => {
        const response = await request.post('/api/clients', {
            data: {
                name: 'No Token Client',
                contactEmail: 'notoken@example.com'
            }
        });

        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    // Authorisation (403)

    test('CLIENT role can view clients (read-only)', async ({ clientApi }) => {
        const response = await clientApi.get('/api/clients');

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
    });

    test('CLIENT role is forbidden from creating clients', async ({ clientApi }) => {
        const response = await clientApi.post('/api/clients', {
            data: {
                name: 'Client Role Attempt',
                contactEmail: 'clientrole@example.com'
            }
        });

        expect(response.status()).toBe(403);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    // Validation (400)

    test('ADMIN gets 400 when creating a client with an empty body', async ({ adminApi }) => {
        const response = await adminApi.post('/api/clients', { data: {} });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    // Not found (404)

    test('ADMIN gets 404 for an unknown client id', async ({ adminApi }) => {
        // Known backend defect: the endpoint currently returns 500 instead of 404.
        test.fail(true, 'DEF-001: GET /api/clients/:id returns 500 instead of 404');

        const response = await adminApi.get(`/api/clients/${randomUUID()}`);

        expect(response.status()).toBe(404);
        const body = await response.json();
        expect(body.success).toBe(false);
    });
});
