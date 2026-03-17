import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Sprint Lifecycle Validations', () => {

    test('PM can create a Sprint under a Project (Default PLANNING)', async ({ pmApi, testProject }) => {
        const response = await pmApi.post('/api/sprints', {
            data: {
                name: "Q3 Deliverable Sprint",
                projectId: testProject.id
            }
        });

        expect(response.status()).toBe(201);
        const json = await response.json();
        expect(json.data.status).toBe('PLANNING');
    });

    test('PM successfully activates a PLANNING sprint', async ({ pmApi, testSprint }) => {
        const response = await pmApi.patch(`/api/sprints/${testSprint.id}/status`, {
            data: { status: "ACTIVE" }
        });

        expect(response.status()).toBe(200);
        const json = await response.json();
        expect(json.data.status).toBe('ACTIVE');
    });

    test('Invalid State Transition: PM Attempts Closing Sprint with Open Task', async ({ pmApi, testSprint, testProject }) => {
        // 0. Activate the Sprint
        await pmApi.patch(`/api/sprints/${testSprint.id}/status`, { data: { status: "ACTIVE" } });

        // 1. Create an active Task inside the Sprint
        await pmApi.post('/api/tasks', {
            data: { title: "Blocking Task", projectId: testProject.id, sprintId: testSprint.id }
        });

        // 2. Attempt to Close Sprint (Should fail because Task is Open/TODO)
        const response = await pmApi.patch(`/api/sprints/${testSprint.id}/status`, {
            data: { status: "CLOSED" }
        });

        expect(response.status()).toBe(400);
        const json = await response.json();
        expect(json.message).toContain('Cannot close sprint with active open tasks');
    });

    test('Valid State Transition: PM Successfully Closes Empty Sprint', async ({ pmApi, testSprint }) => {
        await pmApi.patch(`/api/sprints/${testSprint.id}/status`, { data: { status: "ACTIVE" } });

        const response = await pmApi.patch(`/api/sprints/${testSprint.id}/status`, {
            data: { status: "CLOSED" }
        });

        expect(response.status()).toBe(200);
    });

    test('Invalid State Transition: PM Attempts to regress a CLOSED sprint', async ({ pmApi, testProject }) => {
        // Create sprint
        const createRes = await pmApi.post('/api/sprints', {
            data: { name: "Regression Test Sprint", projectId: testProject.id }
        });
        const sprintId = (await createRes.json()).data.id;

        // Activate sprint
        await pmApi.patch(`/api/sprints/${sprintId}/status`, { data: { status: "ACTIVE" } });

        // Close sprint
        await pmApi.patch(`/api/sprints/${sprintId}/status`, { data: { status: "CLOSED" } });

        // Attempt to regress sprint back to ACTIVE
        const regressRes = await pmApi.patch(`/api/sprints/${sprintId}/status`, {
            data: { status: "ACTIVE" }
        });

        expect(regressRes.status()).toBe(400);
        const json = await regressRes.json();
        expect(json.message).toContain('Illegal sprint state transition');
    });

});
