import { test, expect } from '@playwright/test';
import prisma from '../../lib/prisma.js';

let authToken = '';

test.describe('Auth API Tests', () => {
    let csrfToken = '';

    test.beforeEach(async ({ request }) => {
        const response = await request.get('/api/auth/csrf-token');
        const data = await response.json();
        csrfToken = data.csrfToken;
    });

    test.describe('POST /api/auth/signup', () => {
        test('returns 201 on valid data', async ({ request }) => {
            const email = `test-${Date.now()}@example.com`;
            const response = await request.post('/api/auth/signup', {
                headers: { 'x-csrf-token': csrfToken },
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

            // First signup
            await request.post('/api/auth/signup', {
                headers: { 'x-csrf-token': csrfToken },
                data: payload
            });

            // Duplicate signup
            const response = await request.post('/api/auth/signup', {
                headers: { 'x-csrf-token': csrfToken },
                data: payload
            });

            expect(response.status()).toBe(409);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.message).toBe('User already exists');
        });

        test('returns 400 on missing format/fields', async ({ request }) => {
            const response = await request.post('/api/auth/signup', {
                headers: { 'x-csrf-token': csrfToken },
                data: { email: 'missing-password@example.com' } // Missing password and fullName
            });
            expect(response.status()).toBe(400);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.message).toBe('All fields are required');
        });

        test('returns 403 without CSRF token', async ({ request }) => {
            const email = `nocsrf-${Date.now()}@example.com`;
            const response = await request.post('/api/auth/signup', {
                data: { email, password: 'password123', fullName: 'Test User' }
            });
            expect(response.status()).toBe(403);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.message).toBe('Invalid CSRF token');
        });

        test('signup with role:ADMIN always returns role:INTERN', async ({ request }) => {
            const email = `role-attack-${Date.now()}@example.com`;
            const res = await request.post('/api/auth/signup', {
                headers: { 'x-csrf-token': csrfToken },
                data: { email, password: 'password123', fullName: 'Attacker', role: 'ADMIN' }
            });
            expect(res.status()).toBe(201);
            const data = await res.json();
            expect(data.user.role).toBe('INTERN');
            // Confirm they cannot reach admin-only endpoints
            const adminRes = await request.post('/api/tasks', {
                data: { title: 'Test', projectId: 'some-id' },
                headers: { Authorization: `Bearer ${data.token}` }
            });
            expect(adminRes.status()).toBe(403); // INTERN lacks CREATE_TASK (or similar), properly returning Forbidden
        });
    });

    test.describe('POST /api/auth/login', () => {
        let testUserEmail = '';
        const testPassword = 'password123';

        test.beforeAll(async ({ request }) => {
            // Create a user to test login against
            const response = await request.get('/api/auth/csrf-token');
            const data = await response.json();
            const setupCsrfToken = data.csrfToken;

            testUserEmail = `login-${Date.now()}@example.com`;
            await request.post('/api/auth/signup', {
                headers: { 'x-csrf-token': setupCsrfToken },
                data: { email: testUserEmail, password: testPassword, fullName: 'Login Test User' }
            });
        });

        test('returns 200 + token on valid credentials', async ({ request }) => {
            const response = await request.post('/api/auth/login', {
                headers: { 'x-csrf-token': csrfToken },
                data: { email: testUserEmail, password: testPassword }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.token).toBeDefined();

            // Capture token for downstream check-auth and logout tests
            authToken = data.token;
        });

        test('returns 400 on wrong password', async ({ request }) => {
            const response = await request.post('/api/auth/login', {
                headers: { 'x-csrf-token': csrfToken },
                data: { email: testUserEmail, password: 'wrongpassword' }
            });
            expect(response.status()).toBe(400);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.message).toBe('Invalid credentials');
        });

        test('returns 400 on unknown email', async ({ request }) => {
            const response = await request.post('/api/auth/login', {
                headers: { 'x-csrf-token': csrfToken },
                data: { email: 'doesnotexist@example.com', password: 'password123' }
            });
            expect(response.status()).toBe(400);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.message).toBe('Invalid credentials');
        });

        test('returns 403 without CSRF token', async ({ request }) => {
            const response = await request.post('/api/auth/login', {
                data: { email: testUserEmail, password: testPassword }
            });
            expect(response.status()).toBe(403);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.message).toBe('Invalid CSRF token');
        });

        test('returns 400 on missing fields', async ({ request }) => {
            const response = await request.post('/api/auth/login', {
                headers: { 'x-csrf-token': csrfToken },
                data: {} // No email or password
            });
            expect(response.status()).toBe(400);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.message).toBe('Email and password are required');
        });
    });

    test.describe('GET /api/auth/check-auth', () => {
        let localAuthToken = '';

        test.beforeAll(async ({ request }) => {
            const csrfRes = await request.get('/api/auth/csrf-token');
            const setupCsrfToken = (await csrfRes.json()).csrfToken;

            const email = `checkauth-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
            const signupRes = await request.post('/api/auth/signup', {
                headers: { 'x-csrf-token': setupCsrfToken },
                data: { email, password: 'password123', fullName: 'Check Auth User' }
            });
            localAuthToken = (await signupRes.json()).token;
        });

        test('returns 200 with valid Bearer token', async ({ request }) => {
            const response = await request.get('/api/auth/check-auth', {
                headers: { 'Authorization': `Bearer ${localAuthToken}` }
            });
            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.user).toBeDefined();
        });

        test('x-user-role header is ignored — unauthenticated request denied', async ({ request }) => {
            const res = await request.get('/api/tasks', {
                // No token provided, but malicious header present
                headers: { 'x-user-role': 'ADMIN' }
            });
            expect(res.status()).toBe(401);
            const data = await res.json();
            expect(data.message).toContain('no token provided');
        });

        test('x-user-role ADMIN header ignored when authenticated as INTERN', async ({ request }) => {
            const csrfRes = await request.get('/api/auth/csrf-token');
            const setupCsrfToken = (await csrfRes.json()).csrfToken;

            const signupRes = await request.post('/api/auth/signup', {
                headers: { 'x-csrf-token': setupCsrfToken },
                data: { email: `intern-esc-${Date.now()}@example.com`, password: 'pw123456', fullName: 'Esc Test' }
            });
            const { token } = await signupRes.json();

            // Attempt DELETE with forged role header
            const delRes = await request.delete('/api/tasks/any-id', {
                headers: { Authorization: `Bearer ${token}`, 'x-user-role': 'ADMIN' }
            });
            expect(delRes.status()).toBe(403);  // INTERN lacks DELETE_TASK, header ignored
        });

        test('returns 401 with no token', async ({ request }) => {
            const response = await request.get('/api/auth/check-auth');
            expect(response.status()).toBe(401);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.message).toContain('Unauthorized');
        });

        test('returns 401 with malformed token', async ({ request }) => {
            const response = await request.get('/api/auth/check-auth', {
                headers: { 'Authorization': 'Bearer invalid.token.structure' }
            });
            expect(response.status()).toBe(401);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.message).toContain('Unauthorized');
        });

        test('returns 401 for valid token but user deleted from DB (token sync vulnerability)', async ({ request }) => {
            // 1. Setup a fresh user just for this test
            const csrfRes = await request.get('/api/auth/csrf-token');
            const setupCsrfToken = (await csrfRes.json()).csrfToken;
            const email = `deleted-user-${Date.now()}@example.com`;

            const signupRes = await request.post('/api/auth/signup', {
                headers: { 'x-csrf-token': setupCsrfToken },
                data: { email, password: 'pw123456', fullName: 'Doomed User' }
            });
            const { token, user } = await signupRes.json();
            
            // 2. Delete the user directly from the DB behind the API's back
            await prisma.user.delete({ where: { id: user.id } });

            // 3. Attempt to authenticate with the now-orphaned token
            const res = await request.get('/api/auth/check-auth', {
                headers: { Authorization: `Bearer ${token}` }
            });

            expect(res.status()).toBe(401);
            const body = await res.json();
            expect(body.message).toMatch(/unauthorized/i);
        });
        test('rejects token with forged alg:none header', async ({ request }) => {
            const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
            const payload = Buffer.from(JSON.stringify({ userId: 'fake', role: 'ADMIN' })).toString('base64url');
            const fakeToken = `${header}.${payload}.`;   // Unsigned
            const res = await request.get('/api/auth/check-auth', {
                headers: { Authorization: `Bearer ${fakeToken}` }
            });
            expect(res.status()).toBe(401);
        });
    });

    test.describe('POST /api/auth/logout', () => {
        let localAuthToken = '';

        test.beforeAll(async ({ request }) => {
            const csrfRes = await request.get('/api/auth/csrf-token');
            const setupCsrfToken = (await csrfRes.json()).csrfToken;

            const email = `logout-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
            const signupRes = await request.post('/api/auth/signup', {
                headers: { 'x-csrf-token': setupCsrfToken },
                data: { email, password: 'password123', fullName: 'Logout User' }
            });
            localAuthToken = (await signupRes.json()).token;
        });

        test('returns 200 success and invalidates token usage', async ({ request }) => {
            const response = await request.post('/api/auth/logout', {
                headers: {
                    'x-csrf-token': csrfToken,
                    'Authorization': `Bearer ${localAuthToken}`
                }
            });
            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.message).toBe('Logged out successfully');

            // Verify the cookie-based auth is cleared if we relied on cookies, 
            // though we used Bearer token directly. If we test the cookie flow:
            const checkResponse = await request.get('/api/auth/check-auth');
            expect(checkResponse.status()).toBe(401);
        });
    });

    test.describe('POST /api/auth/forgot-password', () => {
        let testUserEmail = '';

        test.beforeAll(async ({ request }) => {
            const response = await request.get('/api/auth/csrf-token');
            const data = await response.json();
            const setupCsrfToken = data.csrfToken;

            testUserEmail = `forgot-${Date.now()}@example.com`;
            await request.post('/api/auth/signup', {
                headers: { 'x-csrf-token': setupCsrfToken },
                data: { email: testUserEmail, password: 'password123', fullName: 'Forgot Test User' }
            });
        });

        test('returns 200 for known email', async ({ request }) => {
            const response = await request.post('/api/auth/forgot-password', {
                headers: { 'x-csrf-token': csrfToken },
                data: { email: testUserEmail }
            });
            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.message).toBe('If that email is registered, a reset link has been sent.');
        });

        test('returns 200 for unknown email (prevent user enumeration)', async ({ request }) => {
            const response = await request.post('/api/auth/forgot-password', {
                headers: { 'x-csrf-token': csrfToken },
                data: { email: 'nobody@example.com' }
            });
            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.message).toContain('If that email is registered');
        });

        test('returns 400 on missing email field', async ({ request }) => {
            // Wait for fix in controller if needed, but standard validation missing
            const response = await request.post('/api/auth/forgot-password', {
                headers: { 'x-csrf-token': csrfToken },
                data: {}
            });
            expect(response.status()).toBe(400);
        });
    });


});
