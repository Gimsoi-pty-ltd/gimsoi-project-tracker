import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Task Creation & Pipeline Validation', () => {

    test('Create Active Task Inside Sprint', async ({ pmApi, testProject, testSprint }) => {
        const response = await pmApi.post('/api/tasks', {
            data: {
                title: "Deploy AI DB Update",
                projectId: testProject.id,
                sprintId: testSprint.id
            }
        });

        expect(response.status()).toBe(201);
        const json = await response.json();
        expect(json.data.status).toBe('TODO');
    });

    test('PM Completes Task', async ({ pmApi, testProject, testSprint }) => {
        // Create the task
        const taskRes = await pmApi.post('/api/tasks', {
            data: {
                title: "Task to complete",
                projectId: testProject.id,
                sprintId: testSprint.id
            }
        });
        const taskData = await taskRes.json();
        const taskId = taskData.data.id;

        // Finish It
        const finishRes = await pmApi.put(`/api/tasks/${taskId}`, {
            data: { status: "DONE" }
        });

        expect(finishRes.status()).toBe(200);
        const json = await finishRes.json();
        expect(json.data.status).toBe('DONE');
    });

    test('Non-reporter Intern is blocked from updating a task via 403 Forbidden', async ({ pmApi, internApi, testProject, testSprint }) => {
        // PM creates the task
        const taskRes = await pmApi.post('/api/tasks', {
            data: {
                title: "Top Secret PM Task",
                projectId: testProject.id,
                sprintId: testSprint.id
            }
        });
        const taskData = await taskRes.json();
        const taskId = taskData.data.id;

        // Intern attempts to update the task they didn't report
        const finishRes = await internApi.put(`/api/tasks/${taskId}`, {
            data: { status: "DONE" }
        });

        // Must explicitly assert 403 Forbidden
        expect(finishRes.status()).toBe(403);
    });

    test('Updating task with invalid status returns 400 StateTransitionError', async ({ pmApi, testProject, testSprint }) => {
        // PM creates a task they own (as reporter)
        const taskRes = await pmApi.post('/api/tasks', {
            data: {
                title: "Status Validation Task",
                projectId: testProject.id,
                sprintId: testSprint.id
            }
        });
        expect(taskRes.status()).toBe(201);
        const taskId = (await taskRes.json()).data.id;

        // Attempt to set an invalid status value
        const updateRes = await pmApi.put(`/api/tasks/${taskId}`, {
            data: { status: "INVALID_STATUS" }
        });

        expect(updateRes.status()).toBe(400);
        const json = await updateRes.json();
        expect(json.message).toContain('Invalid task status');
        expect(json.message).toContain('INVALID_STATUS');
    });

});
