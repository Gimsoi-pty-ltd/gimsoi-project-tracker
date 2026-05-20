import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Custom Fixture Verification', () => {

    test('pmApi fixture automatically authenticates and accesses protected route', async ({ pmApi }) => {
        // We use the pmApi context which should already have a valid JWT and CSRF token.
        // Call the check-auth endpoint which requires Authentication
        const response = await pmApi.get('/api/auth/check-auth');

        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.user).toBeDefined();
        expect(data.user.role).toBe('PM');
    });

    test('adminApi fixture automatically authenticates', async ({ adminApi }) => {
        const response = await adminApi.get('/api/auth/check-auth');
        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data.user.role).toBe('ADMIN');
    });

});
