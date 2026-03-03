import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Project Lifecycle & Ownership Validation', () => {

    test('PM can create a project under an existing client', async ({ pmApi, testClient }) => {
        const response = await pmApi.post('/api/projects', {
            data: {
                name: "PM Target Validation Project",
                clientId: testClient.id
            }
        });

        expect(response.status()).toBe(201);
        const json = await response.json();
        expect(json.data.status).toBe('DRAFT');
        expect(json.data.id).toBeDefined();
    });

    test('Intern gets 403 when modifying a PM project', async ({ internApi, testProject }) => {
        const response = await internApi.patch(`/api/projects/${testProject.id}`, {
            data: { name: "Hacked Name" }
        });

        expect(response.status()).toBe(403);
    });

    test('PM can successfully activate a DRAFT project', async ({ pmApi, testProject }) => {
        const response = await pmApi.patch(`/api/projects/${testProject.id}`, {
            data: { status: "ACTIVE" }
        });

        expect(response.status()).toBe(200);
        const json = await response.json();
        expect(json.data.status).toBe('ACTIVE');
    });

    test('Illegal State Transition prevents COMPLETED project from regressing to DRAFT', async ({ pmApi, testProject }) => {
        // First transition DRAFT -> COMPLETED
        let response = await pmApi.patch(`/api/projects/${testProject.id}`, {
            data: { status: "COMPLETED" }
        });
        expect(response.status()).toBe(200);

        // Attempt to illegally regress COMPLETED -> DRAFT
        response = await pmApi.patch(`/api/projects/${testProject.id}`, {
            data: { status: "DRAFT" }
        });

        expect(response.status()).toBe(400);
        const json = await response.json();
        expect(json.message).toContain('Illegal project state transition');
    });

});
