import { test, expect } from '@playwright/test';
import prisma from '../../lib/prisma.js';

/**
 * Helper to fetch XSRF-TOKEN explicitly.
 */
async function fetchCsrfToken(request, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await request.get('/api/auth/csrf-token', { headers });
    const body = await res.json();
    return body.csrfToken || '';
}

test.describe('Users API Tests', () => {
    let adminToken = '';
    let adminCsrf = '';
    let userToken = '';
    let userCsrf = '';
    let adminEmail = '';
    let userEmail = '';
    const password = 'Password123!';

    test.beforeAll(async ({ request }) => {
        const id = Math.random().toString(36).substring(2, 15);
        adminEmail = `admin-${id}-${Date.now()}@test.com`;
        userEmail = `user-${id}-${Date.now()}@test.com`;
        
        // 1. Setup Admin
        const adminSignupRes = await request.post('/api/auth/signup', {
            data: { email: adminEmail, password, fullName: 'Admin User' }
        });
        expect(adminSignupRes.status(), `Admin signup failed: ${await adminSignupRes.text()}`).toBe(201);
        const adminSignupData = await adminSignupRes.json();

        let adminTempCsrf = await fetchCsrfToken(request, adminSignupData.token);

        const promoteAdminRes = await request.post('/api/testing/promote-role', {
            headers: { 
                'x-csrf-token': adminTempCsrf,
                'Authorization': `Bearer ${adminSignupData.token}`
            },
            data: { email: adminEmail, role: 'ADMIN' }
        });
        expect(promoteAdminRes.status()).toBe(200);

        const adminLoginRes = await request.post('/api/auth/login', {
            data: { email: adminEmail, password }
        });
        const adminLoginData = await adminLoginRes.json();
        adminToken = adminLoginData.token;
        adminCsrf = await fetchCsrfToken(request, adminToken);

        // 2. Setup Regular User
        const userSignupRes = await request.post('/api/auth/signup', {
            data: { email: userEmail, password, fullName: 'Regular User' }
        });
        expect(userSignupRes.status(), `User signup failed: ${await userSignupRes.text()}`).toBe(201);
        const userSignupData = await userSignupRes.json();

        let userTempCsrf = await fetchCsrfToken(request, userSignupData.token);

        await request.post('/api/testing/promote-role', {
            headers: { 
                'x-csrf-token': userTempCsrf,
                'Authorization': `Bearer ${userSignupData.token}`
            },
            data: { email: userEmail, role: 'INTERN' }
        });

        const userLoginRes = await request.post('/api/auth/login', {
            data: { email: userEmail, password }
        });
        const userLoginData = await userLoginRes.json();
        userToken = userLoginData.token;
        userCsrf = await fetchCsrfToken(request, userToken);
    });

    test.describe('GET /api/users (Admin Only)', () => {
        test('Admin can list users', async ({ request }) => {
            const response = await request.get('/api/users', {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.success).toBe(true);
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.data.length).toBeGreaterThan(0);
            expect(body.data[0]).not.toHaveProperty('password');
        });

        test('Non-admin cannot list users', async ({ request }) => {
            const response = await request.get('/api/users', {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            expect(response.status()).toBe(403);
        });
    });

    test.describe('POST /api/users (Admin Create)', () => {
        test('Admin can create user with role', async ({ request }) => {
            const newEmail = `created-${Date.now()}@test.com`;
            const response = await request.post('/api/users', {
                headers: { 
                    Authorization: `Bearer ${adminToken}`,
                    'x-csrf-token': adminCsrf
                },
                data: {
                    email: newEmail,
                    password: 'Password123!',
                    fullName: 'Created By Admin',
                    role: 'PM'
                }
            });
            expect(response.status()).toBe(201);
            const body = await response.json();
            expect(body.data.role).toBe('PM');
            expect(body.data.isVerified).toBe(true);
        });

        test('Non-admin cannot create user', async ({ request }) => {
            const response = await request.post('/api/users', {
                headers: { 
                    Authorization: `Bearer ${userToken}`,
                    'x-csrf-token': userCsrf
                },
                data: {
                    email: `fail-${Date.now()}@test.com`,
                    password: 'Password123!',
                    fullName: 'Should Fail',
                    role: 'ADMIN'
                }
            });
            expect(response.status()).toBe(403);
        });
    });

    test.describe('PATCH /api/users/:id/role (Admin Only)', () => {
        test('Admin can promote user', async ({ request }) => {
            // Find the regular user
            const usersRes = await request.get('/api/users', {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            const users = (await usersRes.json()).data;
            const targetUser = users.find(u => u.email === userEmail);

            const response = await request.patch(`/api/users/${targetUser.id}/role`, {
                headers: { 
                    Authorization: `Bearer ${adminToken}`,
                    'x-csrf-token': adminCsrf
                },
                data: { role: 'PM' }
            });
            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.data.role).toBe('PM');
        });

        test('Admin cannot change their own role', async ({ request }) => {
            const meRes = await request.get('/api/auth/check-auth', {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            const me = (await meRes.json()).user;

            const response = await request.patch(`/api/users/${me.id}/role`, {
                headers: { 
                    Authorization: `Bearer ${adminToken}`,
                    'x-csrf-token': adminCsrf
                },
                data: { role: 'INTERN' }
            });
            expect(response.status()).toBe(403);
            expect((await response.json()).message).toContain('own role');
        });
    });

    test.describe('PATCH /api/users/me (Self)', () => {
        test('User can update their own profile', async ({ request }) => {
            const newName = 'Updated Name';
            const response = await request.patch('/api/users/me', {
                headers: { 
                    Authorization: `Bearer ${userToken}`,
                    'x-csrf-token': userCsrf
                },
                data: { fullName: newName }
            });
            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.data.fullName).toBe(newName);
        });
    });

    test.describe('POST /api/users/me/avatar (Self)', () => {
        test('User can upload an avatar', async ({ request }) => {
            // Mock a small transparent pixel image buffer
            const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
            
            const response = await request.post('/api/users/me/avatar', {
                headers: { 
                    Authorization: `Bearer ${userToken}`,
                    'x-csrf-token': userCsrf
                },
                multipart: {
                    avatar: {
                        name: 'test.png',
                        mimeType: 'image/png',
                        buffer: buffer,
                    }
                }
            });
            
            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.data.avatarUrl).toContain('data:image/png;base64,');
        });

        test('Fails on non-image file', async ({ request }) => {
            const response = await request.post('/api/users/me/avatar', {
                headers: { 
                    Authorization: `Bearer ${userToken}`,
                    'x-csrf-token': userCsrf
                },
                multipart: {
                    avatar: {
                        name: 'test.txt',
                        mimeType: 'text/plain',
                        buffer: Buffer.from('hello'),
                    }
                }
            });
            expect(response.status()).toBe(400);
        });
    });

    test.describe('GET /api/clients (Sanity Check)', () => {
        test('Endpoint returns client data', async ({ request }) => {
            const response = await request.get('/api/clients', {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.success).toBe(true);
            expect(Array.isArray(body.data)).toBe(true);
        });
    });
});
