import { test, expect } from '../fixtures/authFixtures.js';

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