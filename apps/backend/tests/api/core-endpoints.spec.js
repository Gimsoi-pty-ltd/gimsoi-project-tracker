
import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Task 3 - Core API Endpoints', () => {
    test('ADMIN can create a Client', async ({ adminApi }) => {
        const response = await adminApi.post('/api/clients', {
            data: {
                name: `Task 3 Client ${Date.now()}`,
                contactEmail: 'task3@example.com'
            }
        });

        expect(response.status()).toBe(201);

        const json = await response.json();
        expect(json.data.id).toBeDefined();
        expect(json.data.name).toContain('Task 3 Client');
    });

    test('ADMIN can retrieve the list of Clients', async ({ adminApi }) => {
        const response = await adminApi.get('/api/clients');

        expect(response.status()).toBe(200);

        const json = await response.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
    });

    test('ADMIN can retrieve a Client by ID', async ({ adminApi }) => {
        const createResponse = await adminApi.post('/api/clients', {
            data: {
                name: `Task 3 Retrieve ${Date.now()}`,
                contactEmail: 'retrieve@example.com'
            }
        });

        expect(createResponse.status()).toBe(201);

        const createdClient = (await createResponse.json()).data;
        const response = await adminApi.get(
            `/api/clients/${createdClient.id}`
        );

        expect(response.status()).toBe(200);

        const json = await response.json();
        expect(json.data.id).toBe(createdClient.id);
    });

    test('ADMIN can update a Client using versioning', async ({ adminApi }) => {
        const createResponse = await adminApi.post('/api/clients', {
            data: {
                name: `Task 3 Update ${Date.now()}`,
                contactEmail: 'update@example.com'
            }
        });

        expect(createResponse.status()).toBe(201);

        const client = (await createResponse.json()).data;

        const response = await adminApi.patch(`/api/clients/${client.id}`, {
            data: {
                name: 'Updated Task 3 Client',
                version: client.version
            }
        });

        expect(response.status()).toBe(200);

        const json = await response.json();
        expect(json.data.name).toBe('Updated Task 3 Client');
    });

    test('ADMIN can delete a Client', async ({ adminApi }) => {
        const createResponse = await adminApi.post('/api/clients', {
            data: {
                name: `Task 3 Delete ${Date.now()}`,
                contactEmail: 'delete@example.com'
            }
        });

        expect(createResponse.status()).toBe(201);

        const client = (await createResponse.json()).data;

        const response = await adminApi.delete(
            `/api/clients/${client.id}`
        );

        expect([200, 204]).toContain(response.status());
    });

    test('INTERN is forbidden from creating Clients', async ({ internApi }) => {
        const response = await internApi.post('/api/clients', {
            data: {
                name: `Task 3 Forbidden ${Date.now()}`,
                contactEmail: 'forbidden@example.com'
            }
        });

        expect(response.status()).toBe(403);
    });

    test('Creating a Client without a name is rejected', async ({ adminApi }) => {
        const response = await adminApi.post('/api/clients', {
            data: {
                contactEmail: 'invalid@example.com'
            }
        });

        expect([400, 422]).toContain(response.status());
    });
});

// Added for Task 8: health endpoint tests.

test.describe('Health API', () => {
    test('GET /api/health returns 200 with status, database, mail and time', async ({ request }) => {
        const response = await request.get('/api/health');

        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('application/json');

        const body = await response.json();
        expect(body.status).toBe('ok');
        expect(body.database).toBe('ok');
        expect(body.mail).toBe('ok'); // mail check is skipped when NODE_ENV=test
        expect(Number.isNaN(Date.parse(body.time))).toBe(false);
    });

    test('GET /api/health does not require authentication', async ({ request }) => {
        const response = await request.get('/api/health');
        expect(response.status()).not.toBe(401);
    });
});
