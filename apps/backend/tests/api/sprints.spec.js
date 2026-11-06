
import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Sprint Lifecycle Validations', () => {

    test('PM can create a Sprint under a Project (Default PLANNING)', async ({ pmApi, testProject }) => {
        const response = await pmApi.post('/api/sprints', {
            data: {
                name: "Q3 Deliverable Sprint",
                projectId: testProject.id,
                goal: "Finish Q3 deliverables"
            }
        });

        expect(response.status()).toBe(201);
        const json = await response.json();
        expect(json.data.status).toBe('PLANNING');
        expect(json.data.goal).toBe("Finish Q3 deliverables");
    });

    test('PM successfully activates a PLANNING sprint', async ({ pmApi, testSprint }) => {
        const response = await pmApi.patch(`/api/sprints/${testSprint.id}/status`, {
            data: { status: "ACTIVE", version: testSprint.version }
        });

        expect(response.status()).toBe(200);
        const json = await response.json();
        expect(json.data.status).toBe('ACTIVE');
    });

    test('Invalid State Transition: PM Attempts Closing Sprint with Open Task', async ({ pmApi, testSprint, testProject }) => {
        // 0. Activate the Sprint
        const res1 = await pmApi.patch(`/api/sprints/${testSprint.id}/status`, { data: { status: "ACTIVE", version: testSprint.version } });
        const s1 = (await res1.json()).data;

        // 1. Create an active Task inside the Sprint
        await pmApi.post('/api/tasks', {
            data: { title: "Blocking Task", projectId: testProject.id, sprintId: testSprint.id }
        });

        // 2. Attempt to Close Sprint (Should fail because Task is Open/TODO)
        const response = await pmApi.patch(`/api/sprints/${testSprint.id}/status`, {
            data: { status: "CLOSED", version: s1.version }
        });

        expect(response.status()).toBe(400);
        const json = await response.json();
        expect(json.message).toContain('Cannot close sprint with active open tasks');
    });

    test('Valid State Transition: PM Successfully Closes Empty Sprint', async ({ pmApi, testSprint }) => {
        const res1 = await pmApi.patch(`/api/sprints/${testSprint.id}/status`, { data: { status: "ACTIVE", version: testSprint.version } });
        const s1 = (await res1.json()).data;

        const response = await pmApi.patch(`/api/sprints/${testSprint.id}/status`, {
            data: { status: "CLOSED", version: s1.version }
        });

        expect(response.status()).toBe(200);
    });

    test.describe('Invalid Status Transitions', () => {

        test('PLANNING → CLOSED transition is blocked (must activate first)', async ({ pmApi, testSprint }) => {
            const response = await pmApi.patch(`/api/sprints/${testSprint.id}/status`, {
                data: { status: 'CLOSED', version: testSprint.version }
            });

            expect(response.status()).toBe(400);
            const json = await response.json();
            expect(typeof json.message).toBe('string');
        });

        test('CLOSED → ACTIVE regression is blocked (sprint cannot be reopened)', async ({ pmApi, testSprint }) => {
            // Setup: Reach CLOSED state correctly
            const res1 = await pmApi.patch(`/api/sprints/${testSprint.id}/status`, { data: { status: 'ACTIVE', version: testSprint.version } });
            const s1 = (await res1.json()).data;
            const res2 = await pmApi.patch(`/api/sprints/${testSprint.id}/status`, { data: { status: 'CLOSED', version: s1.version } });
            const s2 = (await res2.json()).data;

            const response = await pmApi.patch(`/api/sprints/${testSprint.id}/status`, {
                data: { status: 'ACTIVE', version: s2.version }
            });

            expect(response.status()).toBe(400);
            const json = await response.json();
            expect(typeof json.message).toBe('string');
        });

    });

    test('User can fetch sprint burndown chart data', async ({ pmApi, testSprint }) => {
        const response = await pmApi.get(`/api/sprints/${testSprint.id}/burndown`);
        expect(response.status()).toBe(200);
        const json = await response.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
        if (json.data.length > 0) {
            expect(json.data[0]).toHaveProperty('day');
            expect(json.data[0]).toHaveProperty('ideal');
            expect(json.data[0]).toHaveProperty('actual');
        }
    });
});

// Added for Task 8: negative-path tests (authentication, role, validation).
const randomUUID = () => globalThis.crypto.randomUUID();

test.describe('Sprints API - authentication, authorisation, validation and errors', () => {

    // ---- Authentication (401) ----

    test('GET /api/sprints without a token returns 401', async ({ request }) => {
        const response = await request.get('/api/sprints');

        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('POST /api/sprints without a token returns 401', async ({ request }) => {
        const response = await request.post('/api/sprints', {
            data: { name: 'No Token Sprint', projectId: randomUUID() },
        });

        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    // ---- Authorisation (403) ----

    test('CLIENT role can view sprints of a project (read-only)', async ({ clientApi, testProject }) => {
        const response = await clientApi.get(`/api/sprints?projectId=${testProject.id}`);

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
    });

    test('GET /api/sprints without projectId returns 400', async ({ pmApi }) => {
        const response = await pmApi.get('/api/sprints');

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
        expect(body.message).toContain('projectId');
    });

    test('INTERN is forbidden from creating sprints', async ({ internApi }) => {
        const response = await internApi.post('/api/sprints', {
            data: { name: 'Intern Sprint', projectId: randomUUID() },
        });

        expect(response.status()).toBe(403);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('CLIENT is forbidden from creating sprints', async ({ clientApi }) => {
        const response = await clientApi.post('/api/sprints', {
            data: { name: 'Client Sprint', projectId: randomUUID() },
        });

        expect(response.status()).toBe(403);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    // ---- Validation (400) ----

    test('PM gets 400 when creating a sprint with an empty body', async ({ pmApi }) => {
        const response = await pmApi.post('/api/sprints', { data: {} });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when projectId is not a valid UUID', async ({ pmApi }) => {
        const response = await pmApi.post('/api/sprints', {
            data: { name: 'Bad Project Id', projectId: 'not-a-uuid' },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when the sprint name is empty', async ({ pmApi, testProject }) => {
        const response = await pmApi.post('/api/sprints', {
            data: { name: '', projectId: testProject.id },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when the sprint status is not a valid value', async ({ pmApi, testSprint }) => {
        const response = await pmApi.patch(`/api/sprints/${testSprint.id}/status`, {
            data: { status: 'FLYING', version: testSprint.version ?? 1 },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('PM gets 400 when changing sprint status without a version', async ({ pmApi, testSprint }) => {
        const response = await pmApi.patch(`/api/sprints/${testSprint.id}/status`, {
            data: { status: 'ACTIVE' },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });
});
