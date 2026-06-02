import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Search, Reports, and Phases API Tests', () => {

    // --- Global Search ---
    test('GET /api/search › returns results from all categories', async ({ pmApi }) => {
        const response = await pmApi.get('/api/search?q=Test&type=all');
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.data).toHaveProperty('tasks');
        expect(body.data).toHaveProperty('projects');
        expect(body.data).toHaveProperty('users');
    });

    test('GET /api/search › returns only requested type', async ({ pmApi }) => {
        const response = await pmApi.get('/api/search?q=Test&type=user');
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data.tasks).toHaveLength(0);
        expect(body.data.projects).toHaveLength(0);
        expect(body.data.users.length).toBeGreaterThanOrEqual(0);
    });

    // --- Phases ---
    test.describe('Phase Lifecycle', () => {
        test('POST /api/phases › creates a phase', async ({ pmApi, testProject }) => {
            const response = await pmApi.post('/api/phases', {
                data: { name: 'Initial Research', projectId: testProject.id }
            });
            expect(response.status()).toBe(201);
            const body = await response.json();
            expect(body.data.name).toBe('Initial Research');
        });

        test('GET /api/phases › lists phases for project', async ({ pmApi, testProject }) => {
            // Create a phase first
            await pmApi.post('/api/phases', {
                data: { name: 'Phase To List', projectId: testProject.id }
            });

            const response = await pmApi.get(`/api/phases?projectId=${testProject.id}`);
            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.data.length).toBeGreaterThan(0);
        });

        test('PATCH /api/phases/:id › updates a phase', async ({ pmApi, testProject }) => {
            const createRes = await pmApi.post('/api/phases', {
                data: { name: 'Old Phase Name', projectId: testProject.id }
            });
            const phase = (await createRes.json()).data;

            const response = await pmApi.patch(`/api/phases/${phase.id}`, {
                data: { name: 'Updated Phase Name', version: phase.version }
            });
            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.data.name).toBe('Updated Phase Name');
        });
    });

    // --- Reports & PDF ---
    test.describe('Reports and PDF Export', () => {
        test('POST /api/reports › creates a report entry', async ({ pmApi, testProject }) => {
            const response = await pmApi.post('/api/reports', {
                data: { name: 'Performance Report', type: 'PROJECT_PROGRESS', projectId: testProject.id }
            });
            expect(response.status()).toBe(201);
            const body = await response.json();
            expect(body.data.name).toBe('Performance Report');
        });

        test('GET /api/reports/:id/pdf › downloads a binary PDF', async ({ pmApi, testProject }) => {
            const createRes = await pmApi.post('/api/reports', {
                data: { name: 'PDF Export Test', type: 'PROJECT_PROGRESS', projectId: testProject.id }
            });
            const report = (await createRes.json()).data;

            const response = await pmApi.get(`/api/reports/${report.id}/pdf`);
            expect(response.status()).toBe(200);
            expect(response.headers()['content-type']).toBe('application/pdf');
            const buffer = await response.body();
            expect(buffer.length).toBeGreaterThan(100);
            // pdfkit starts with %PDF
            expect(buffer.slice(0, 4).toString()).toBe('%PDF');
        });
    });

    // --- Team Analytics ---
    test('GET /api/analytics/team › returns metrics for all users', async ({ pmApi }) => {
        const response = await pmApi.get('/api/analytics/team');
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.data.length).toBeGreaterThan(0);
        expect(body.data[0]).toHaveProperty('metrics');
        expect(body.data[0].metrics).toHaveProperty('completionRate');
        expect(body).toHaveProperty('nextCursor');
    });

    test('GET /api/analytics/team › respects limit and returns nextCursor', async ({ pmApi }) => {
        // Fetch with limit=1
        const response = await pmApi.get('/api/analytics/team?limit=1');
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data).toHaveLength(1);
        expect(body.nextCursor).not.toBeNull();
    });

    // --- Phase Security ---
    test('GET /api/phases/:id › forbids access to phase from another PMs project', async ({ pmApi, internApi, testProject }) => {
        // pmApi creates a phase in their project
        const createRes = await pmApi.post('/api/phases', {
            data: { name: 'Secret Phase', projectId: testProject.id }
        });
        const phase = (await createRes.json()).data;

        // internApi (not assigned to project) attempts to view it
        // Note: In our current simple ownership logic, an INTERN can only see things they created or if they are an ADMIN/PM.
        // Actually, internApi is a separate user.
        const response = await internApi.get(`/api/phases/${phase.id}`);
        expect(response.status()).toBe(403);
    });

    // --- Sprint Velocity ---
    test('GET /api/sprints/:id/velocity › returns velocity count', async ({ pmApi, testSprint }) => {
        const response = await pmApi.get(`/api/sprints/${testSprint.id}/velocity`);
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data).toHaveProperty('velocity');
        expect(typeof body.data.velocity).toBe('number');
    });
});
