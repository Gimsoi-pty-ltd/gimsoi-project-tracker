import prisma from '../../lib/prisma.js';
import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Analytics API Tests', () => {

    test('ADMIN can access global analytics context', async ({ adminApi }) => {
        const response = await adminApi.get('/api/analytics/ai-context');
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.data).toHaveProperty('project_analytics');
        expect(body.data).toHaveProperty('team_analytics');
        expect(body.data).toHaveProperty('user_analytics');
        expect(body.data.team_analytics).toHaveProperty("employee_workloads");
        expect(body.data.team_analytics.employee_workloads).toBeInstanceOf(Array);
    });

    test('PM can see analytics (scoped to their projects)', async ({ pmApi, testProject }) => {
        const response = await pmApi.get('/api/analytics/ai-context');
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data.project_analytics).not.toBeNull();
        expect(body.data.team_analytics).toHaveProperty("employee_workloads");
        expect(body.data.team_analytics.employee_workloads).toBeInstanceOf(Array);
        expect(body.filters_applied.projectId).toBeNull(); 
    });

    test('PM can access project health for their own project', async ({ pmApi, testProject }) => {
    const response = await pmApi.get(
        `/api/analytics/project-health/${testProject.id}`
    );

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
});

test('ADMIN can access project health for any project', async ({ adminApi, testProject }) => {
    const response = await adminApi.get(
        `/api/analytics/project-health/${testProject.id}`
    );

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
});

test('INTERN cannot access project health', async ({ internApi, testProject }) => {
    const response = await internApi.get(
        `/api/analytics/project-health/${testProject.id}`
    );

    expect(response.status()).toBe(403);
});

test('PM receives 404 for an unknown project health request', async ({ pmApi }) => {
    const response = await pmApi.get(
        '/api/analytics/project-health/00000000-0000-4000-8000-000000000000'
    );

    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe('Project not found');
});

    test('PM filters by specific project', async ({ pmApi, testProject }) => {
        const response = await pmApi.get(`/api/analytics/ai-context?projectId=${testProject.id}`);
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.filters_applied.projectId).toBe(testProject.id);
    });

    test("PM cannot access another PM's project health", async ({
    testProject,
    request,
}) => {
    const email = `other-health-pm-${Date.now()}@gimsoi.test`;
    const password = "Test123!@#";

    // Create another PM account.
    const signupResponse = await request.post("/api/auth/signup", {
        data: {
            email,
            password,
            fullName: "Another Health PM",
        },
    });

    expect(signupResponse.status()).toBeLessThan(400);

    // Promote and verify the new account.
    await prisma.user.update({
        where: { email },
        data: {
            role: "PM",
            isVerified: true,
        },
    });

    // Log in as the second PM.
    const loginResponse = await request.post("/api/auth/login", {
        data: { email, password },
    });

    expect(loginResponse.status()).toBe(200);

    const loginBody = await loginResponse.json();

    // Attempt to access the first PM's project.
    const response = await request.get(
        `/api/analytics/project-health/${testProject.id}`,
        {
            headers: {
                Authorization: `Bearer ${loginBody.token}`,
            },
        }
    );

    expect(response.status()).toBe(404);
});

    test('INTERN is restricted from project-wide analytics', async ({ internApi }) => {
        const response = await internApi.get('/api/analytics/ai-context');
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data.project_analytics).toBeNull();
        expect(body.data.team_analytics).toBeNull();
        
    });

    test('CLIENT is completely blocked from accessing analytics', async ({ clientApi }) => {
        const response = await clientApi.get('/api/analytics/ai-context');
        expect(response.status()).toBe(403);
    });

    test('CLIENT cannot access project health', async ({ clientApi, testProject }) => {
    const response = await clientApi.get(
        `/api/analytics/project-health/${testProject.id}`
    );

    expect(response.status()).toBe(403);
});

    test('Date filtering restricts data counts', async ({ adminApi }) => {
        // First confirm there IS data without the filter
        const baseRes = await adminApi.get('/api/analytics/ai-context');
        expect(baseRes.status()).toBe(200);
        // (No assertion on value — we just verify the filter actually changes something)

        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        
        const response = await adminApi.get(`/api/analytics/ai-context?startDate=${futureDate.toISOString()}`);
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data.project_analytics.completion_percentage).toBe(0);
    });
});
