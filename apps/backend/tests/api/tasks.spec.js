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

});
