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

});
