import { test, expect } from '@playwright/test';
import prisma from '../../lib/prisma.js';


/**
 * Helper to extract XSRF-TOKEN from response headers.
 */
function getCsrfToken(res) {
    const cookies = res.headers()['set-cookie'] || '';
    const match = cookies.match(/XSRF-TOKEN=([^;]+)/);
    return match ? match[1] : null;
}

test.describe('Auth API Tests', () => {

    test.describe('POST /api/auth/signup', () => {
        test('returns 201 on valid data', async ({ request }) => {
            const email = `test-${Date.now()}@example.com`;
            const response = await request.post('/api/auth/signup', {
                data: { email, password: 'password123', fullName: 'Test User' }
            });
            expect(response.status()).toBe(201);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.token).toBeDefined();
        });

        test('returns 409 on duplicate email', async ({ request }) => {
            const email = `dup-${Date.now()}@example.com`;
            const payload = { email, password: 'password123', fullName: 'Test User' };
            await request.post('/api/auth/signup', { data: payload });
            const response = await request.post('/api/auth/signup', { data: payload });
            expect(response.status()).toBe(409);
        });

        test('returns 400 on missing format/fields', async ({ request }) => {
            const response = await request.post('/api/auth/signup', {
                data: { email: 'missing-password@example.com' }
            });
            expect(response.status()).toBe(400);
        });

        test('signup with role:ADMIN always returns role:INTERN', async ({ request }) => {
            const email = `role-attack-${Date.now()}@example.com`;
            const res = await request.post('/api/auth/signup', {
                data: { email, password: 'password123', fullName: 'Attacker', role: 'ADMIN' }
            });
            const data = await res.json();
            expect(data.user.role).toBe('INTERN');
        });
    });

    test.describe('POST /api/auth/login', () => {
        let testUserEmail = '';
        const testPassword = 'password123';

        test.beforeAll(async ({ request }) => {
            testUserEmail = `login-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
            const signupRes = await request.post('/api/auth/signup', {
                data: { email: testUserEmail, password: testPassword, fullName: 'Login Test User' }
            });
            
            const signupData = await signupRes.json();
            const setupCsrfToken = getCsrfToken(signupRes) || '';
            const setupToken = signupData.token;

            // Verify user via testing endpoint
            const promoteRes = await request.post('/api/testing/promote-role', {
                headers: { 
                    'x-csrf-token': setupCsrfToken,
                    'Authorization': `Bearer ${setupToken}`
                },
                data: { email: testUserEmail, role: 'ADMIN' }
            });
            expect(promoteRes.status()).toBe(200);
        });

        test('returns 200 + token on valid credentials', async ({ request }) => {
            const response = await request.post('/api/auth/login', {
                data: { email: testUserEmail, password: testPassword }
            });
            expect(response.status()).toBe(200);
            const data = await response.json();
            const authToken = data.token;
        });

        test('returns 400 on wrong password', async ({ request }) => {
            const response = await request.post('/api/auth/login', {
                data: { email: testUserEmail, password: 'wrongpassword' }
            });
            expect(response.status()).toBe(400);
        });
    });

    test.describe('GET /api/auth/check-auth', () => {
        let localAuthToken = '';

        test.beforeAll(async ({ request }) => {
            const email = `checkauth-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
            const signupRes = await request.post('/api/auth/signup', {
                data: { email, password: 'password123', fullName: 'Check Auth User' }
            });
            
            const signupData = await signupRes.json();
            const setupCsrfToken = getCsrfToken(signupRes) || '';
            const setupToken = signupData.token;
            
            // Verify user via testing endpoint
            await request.post('/api/testing/promote-role', {
                headers: { 
                    'x-csrf-token': setupCsrfToken,
                    'Authorization': `Bearer ${setupToken}`
                },
                data: { email, role: 'ADMIN' }
            });
            
            localAuthToken = signupData.token;
        });

        test('returns 200 with valid Bearer token', async ({ request }) => {
            const response = await request.get('/api/auth/check-auth', {
                headers: { 'Authorization': `Bearer ${localAuthToken}` }
            });
            expect(response.status()).toBe(200);
        });

        test('returns 401 with no token', async ({ request }) => {
            const response = await request.get('/api/auth/check-auth');
            expect(response.status()).toBe(401);
        });

        test('returns 401 with malformed token', async ({ request }) => {
            const response = await request.get('/api/auth/check-auth', {
                headers: { 'Authorization': 'Bearer invalid.token.structure' }
            });
            expect(response.status()).toBe(401);
        });

        test('returns 401 for valid token but user deleted from DB', async ({ request }) => {
            const email = `deleted-user-${Date.now()}@example.com`;
            const signupRes = await request.post('/api/auth/signup', {
                data: { email, password: 'pw123456', fullName: 'Doomed User' }
            });
            const { token, user } = await signupRes.json();
            await prisma.user.delete({ where: { id: user.id } });
            const res = await request.get('/api/auth/check-auth', {
                headers: { Authorization: `Bearer ${token}` }
            });
            expect(res.status()).toBe(401);
        });
    });

    test.describe('POST /api/auth/logout', () => {
        test('returns 200 success', async ({ request }) => {
            const email = `logout-test-${Date.now()}@test.com`;
            const password = 'Password123!';

            // 1. Signup fresh user
            const signupRes = await request.post('/api/auth/signup', {
                data: { email, password, fullName: 'Logout User' }
            });
            
            // Get CSRF token for the promote-role request
            const signupData = await signupRes.json();
            const setupCsrfToken = getCsrfToken(signupRes) || '';
            const setupToken = signupData.token;

            // Verify user via testing endpoint
            await request.post('/api/testing/promote-role', {
                headers: { 
                    'x-csrf-token': setupCsrfToken,
                    'Authorization': `Bearer ${setupToken}`
                },
                data: { email, role: 'ADMIN' }
            });

            // 2. Login to get token and CSRF token
            const loginRes = await request.post('/api/auth/login', {
                data: { email, password }
            });
            const loginBody = await loginRes.json();
            const csrfToken = getCsrfToken(loginRes);

            // 3. Authorized logout
            const response = await request.post('/api/auth/logout', {
                headers: { Authorization: `Bearer ${loginBody.token}` },
                data: { _csrf: csrfToken }
            });
            expect(response.status()).toBe(200);
        });
    });

    test.describe('POST /api/auth/forgot-password', () => {

        test('returns 200 for known email', async ({ request }) => {
            const email = `forgot-${Date.now()}@example.com`;
            await request.post('/api/auth/signup', {
                data: { email, password: 'password123', fullName: 'Forgot User' }
            });
            const response = await request.post('/api/auth/forgot-password', {
                data: { email }
            });
            expect(response.status()).toBe(200);
        });

        test('returns 200 for unknown email (prevents user enumeration)', async ({ request }) => {
            const response = await request.post('/api/auth/forgot-password', {
                data: { email: `nonexistent-${Date.now()}@nowhere.com` }
            });
            // IMPORTANT: Must return 200 regardless of whether email exists.
            // A 404 here leaks that the email is not registered (user enumeration).
            expect(response.status()).toBe(200);
        });
    });

    test.describe('POST /api/auth/verify-email', () => {
        test('returns 400 with invalid token', async ({ request }) => {
            const response = await request.post('/api/auth/verify-email', {
                data: { code: '123456' }
            });
            expect(response.status()).toBe(400);
        });
    });
});
