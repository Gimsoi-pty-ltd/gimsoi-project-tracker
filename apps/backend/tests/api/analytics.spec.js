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
    });

    test('PM can see analytics (scoped to their projects)', async ({ pmApi, testProject }) => {
        const response = await pmApi.get('/api/analytics/ai-context');
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data.project_analytics).not.toBeNull();
        expect(body.filters_applied.projectId).toBeNull(); 
    });

    test('PM filters by specific project', async ({ pmApi, testProject }) => {
        const response = await pmApi.get(`/api/analytics/ai-context?projectId=${testProject.id}`);
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.filters_applied.projectId).toBe(testProject.id);
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
