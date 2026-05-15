import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Analytics API Tests', () => {

    test('ADMIN can access global analytics context', async ({ adminApi }) => {
        const response = await adminApi.get('/api/analytics/ai-context');
        if (response.status() !== 200) {
            console.log('ADMIN Error Status:', response.status());
            console.log('ADMIN Error Body:', await response.json());
        }
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.data).toHaveProperty('project_analytics');
        expect(body.data).toHaveProperty('team_analytics');
        expect(body.data).toHaveProperty('user_analytics');
    });

    test('PM can see analytics (scoped to their projects)', async ({ pmApi, testProject }) => {
        const response = await pmApi.get('/api/analytics/ai-context');
        if (response.status() !== 200) {
            console.log('PM Error Status:', response.status());
            console.log('PM Error Body:', await response.json());
        }
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data.project_analytics).not.toBeNull();
        expect(body.filters_applied.projectId).toBeNull(); 
    });

    test('PM filters by specific project', async ({ pmApi, testProject }) => {
        const response = await pmApi.get(`/api/analytics/ai-context?projectId=${testProject.id}`);
        if (response.status() !== 200) {
            console.log('PM Filter Error Status:', response.status());
            console.log('PM Filter Error Body:', await response.json());
        }
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

    test('Date filtering restricts data counts', async ({ adminApi }) => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        
        const response = await adminApi.get(`/api/analytics/ai-context?startDate=${futureDate.toISOString()}`);
        if (response.status() !== 200) {
            console.log('Date Filter Error Status:', response.status());
            console.log('Date Filter Error Body:', await response.json());
        }
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data.project_analytics.completion_percentage).toBe(0);
    });
});
