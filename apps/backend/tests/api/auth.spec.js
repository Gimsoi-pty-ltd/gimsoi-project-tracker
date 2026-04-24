import { test, expect } from '@playwright/test';
import prisma from '../../lib/prisma.js';

async function fetchCsrfToken(request) {
    const res = await request.get('/api/auth/csrf-token');
    const body = await res.json();
    return body.csrfToken;
}

test.describe('Auth API Tests', () => {
    let csrfToken = '';

    test.beforeEach(async ({ request }) => {
        csrfToken = await fetchCsrfToken(request);
    });

    test.describe('POST /api/auth/signup', () => {
        test('returns 201 on valid data', async ({ request }) => {
            const email = `test-${Date.now()}@example.com`;
            const response = await request.post('/api/auth/signup', {
                data: { email, password: 'password123', fullName: 'Test User' },
                headers: { 'x-csrf-token': csrfToken }
            });
            expect(response.status()).toBe(201);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.token).toBeDefined();
        });

        test('returns 409 on duplicate email', async ({ request }) => {
            const email = `dup-${Date.now()}@example.com`;
            const payload = { email, password: 'password123', fullName: 'Test User' };
            await request.post('/api/auth/signup', { 
                data: payload,
                headers: { 'x-csrf-token': csrfToken }
            });
            const response = await request.post('/api/auth/signup', { 
                data: payload,
                headers: { 'x-csrf-token': csrfToken }
            });
            expect(response.status()).toBe(409);
        });

        test('returns 400 on missing format/fields', async ({ request }) => {
            const response = await request.post('/api/auth/signup', {
                data: { email: 'missing-password@example.com' },
                headers: { 'x-csrf-token': csrfToken }
            });
            expect(response.status()).toBe(400);
        });

        test('signup with role:ADMIN always returns role:INTERN', async ({ request }) => {
            const email = `role-attack-${Date.now()}@example.com`;
            const res = await request.post('/api/auth/signup', {
                data: { email, password: 'password123', fullName: 'Attacker', role: 'ADMIN' },
                headers: { 'x-csrf-token': csrfToken }
            });
            const data = await res.json();
            expect(data.user.role).toBe('INTERN');
        });
    });

    test.describe('POST /api/auth/login', () => {
        test('returns 200 + token on valid credentials', async ({ request }) => {
            const email = `login-${Date.now()}@example.com`;
            await request.post('/api/auth/signup', {
                data: { email, password: 'password123', fullName: 'Login Test User' },
                headers: { 'x-csrf-token': csrfToken }
            });

            const response = await request.post('/api/auth/login', {
                data: { email, password: 'password123' },
                headers: { 'x-csrf-token': csrfToken }
            });
            expect(response.status()).toBe(200);
        });

        test('returns 400 on wrong password', async ({ request }) => {
            const email = `login-fail-${Date.now()}@example.com`;
            await request.post('/api/auth/signup', {
                data: { email, password: 'password123', fullName: 'Fail User' },
                headers: { 'x-csrf-token': csrfToken }
            });

            const response = await request.post('/api/auth/login', {
                data: { email, password: 'wrongpassword' },
                headers: { 'x-csrf-token': csrfToken }
            });
            expect(response.status()).toBe(400);
        });
    });

    test.describe('GET /api/auth/check-auth', () => {
        test('returns 200 with valid token', async ({ request }) => {
            const email = `checkauth-${Date.now()}@example.com`;
            const signupRes = await request.post('/api/auth/signup', {
                data: { email, password: 'password123', fullName: 'Check Auth User' },
                headers: { 'x-csrf-token': csrfToken }
            });
            const token = (await signupRes.json()).token;

            const response = await request.get('/api/auth/check-auth', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            expect(response.status()).toBe(200);
        });

        test('returns 401 with no token', async ({ request }) => {
            await request.post('/api/auth/logout', { headers: { 'x-csrf-token': csrfToken } });
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
                data: { email, password: 'pw123456', fullName: 'Doomed User' },
                headers: { 'x-csrf-token': csrfToken }
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

            await request.post('/api/auth/signup', {
                data: { email, password, fullName: 'Logout User' },
                headers: { 'x-csrf-token': csrfToken }
            });

            const response = await request.post('/api/auth/logout', {
                headers: { 'x-csrf-token': csrfToken }
            });
            expect(response.status()).toBe(200);
        });
    });

    test.describe('POST /api/auth/forgot-password', () => {
        test('returns 200 for known email', async ({ request }) => {
            const email = `forgot-${Date.now()}@example.com`;
            await request.post('/api/auth/signup', {
                data: { email, password: 'password123', fullName: 'Forgot User' },
                headers: { 'x-csrf-token': csrfToken }
            });
            const response = await request.post('/api/auth/forgot-password', {
                data: { email },
                headers: { 'x-csrf-token': csrfToken }
            });
            expect(response.status()).toBe(200);
        });
    });

    test.describe('POST /api/auth/verify-email', () => {
        test('returns 400 with invalid token', async ({ request }) => {
            const response = await request.post('/api/auth/verify-email', {
                data: { code: '123456' },
                headers: { 'x-csrf-token': csrfToken }
            });
            expect(response.status()).toBe(400);
        });
    });

    test.afterAll(async () => {
        await prisma.$disconnect();
    });
});
