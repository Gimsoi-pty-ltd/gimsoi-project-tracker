import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Report Generation Upgrade — Integration Tests', () => {
    
    test('AC1: POST /api/reports with invalid type returns 400', async ({ pmApi, testProject }) => {
        const response = await pmApi.post('/api/reports', {
            data: {
                name: 'Invalid Report',
                type: 'INVALID_TYPE',
                projectId: testProject.id
            }
        });
        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.message).toContain('Invalid option');
    });

    test('AC2 & AC3: GET /api/reports/:id/pdf returns PDF with security headers', async ({ pmApi, testProject }) => {
        // 1. Create a PROJECT_PROGRESS report
        const createRes = await pmApi.post('/api/reports', {
            data: {
                name: 'Progress Report Test',
                type: 'PROJECT_PROGRESS',
                projectId: testProject.id
            }
        });
        const report = (await createRes.json()).data;

        // 2. Download PDF
        const response = await pmApi.get(`/api/reports/${report.id}/pdf`);
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toBe('application/pdf');
        expect(response.headers()['content-security-policy']).toBe("default-src 'none'");
        expect(response.headers()['x-content-type-options']).toBe('nosniff');

        const buffer = await response.body();
        // PDF Magic Bytes: %PDF-
        expect(buffer.toString('utf8', 0, 5)).toBe('%PDF-');
        expect(buffer.length).toBeGreaterThan(1000); // Branded PDF should be sizeable
    });

    test('AC4: SPRINT_METRICS report is generated successfully', async ({ pmApi, testProject }) => {
        // 1. Create a SPRINT_METRICS report
        const createRes = await pmApi.post('/api/reports', {
            data: {
                name: 'Sprint Metrics Report Test',
                type: 'SPRINT_METRICS',
                projectId: testProject.id
            }
        });
        const report = (await createRes.json()).data;

        // 2. Download PDF
        const response = await pmApi.get(`/api/reports/${report.id}/pdf`);
        expect(response.status()).toBe(200);
        const buffer = await response.body();
        expect(buffer.length).toBeGreaterThan(2000); // Should be larger due to metrics cards
    });

    test('AC5: GET /api/reports/:id/pdf by non-owner returns 403', async ({ pmApi, internApi, testProject }) => {
        // Create report as PM
        const createRes = await pmApi.post('/api/reports', {
            data: {
                name: 'PM Secret Report',
                type: 'PROJECT_PROGRESS',
                projectId: testProject.id
            }
        });
        const report = (await createRes.json()).data;

        // Try to access as INTERN (non-owner)
        const response = await internApi.get(`/api/reports/${report.id}/pdf`);
        expect(response.status()).toBe(403);
    });

    test('AC6: GET /api/reports/:id/pdf for non-existent ID returns 404', async ({ pmApi }) => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const response = await pmApi.get(`/api/reports/${fakeId}/pdf`);
        expect(response.status()).toBe(404);
    });
});
