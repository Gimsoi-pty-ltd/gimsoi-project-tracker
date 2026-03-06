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
                name: `Hacked Client`,
                contactEmail: `hack@example.com`
            }
        });

        expect(response.status()).toBe(403);
    });
});
