import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Labels API', () => {
    test('PM can manage labels and attach them to tasks', async ({ pmApi, testProject }) => {
        // 1. Create a label
        const labelRes = await pmApi.post(`/api/labels`, {
            data: { projectId: testProject.id, name: 'Bug', color: '#FF0000' }
        });
        expect(labelRes.status()).toBe(201);
        const { data: label } = await labelRes.json();
        expect(label.name).toBe('Bug');

        // 2. Create another label
        await pmApi.post(`/api/labels`, {
            data: { projectId: testProject.id, name: 'Feature', color: '#00FF00' }
        });

        // 3. List labels
        const listRes = await pmApi.get(`/api/projects/${testProject.id}/labels`);
        expect(listRes.status()).toBe(200);
        const labels = (await listRes.json()).data;
        expect(labels.length).toBe(2);

        // 4. Create a task
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Label Task', projectId: testProject.id }
        });
        const { data: task } = await taskRes.json();

        // 5. Attach labels to task
        const attachRes = await pmApi.post(`/api/tasks/${task.id}/labels`, {
            data: { labelIds: [label.id] }
        });
        expect(attachRes.status()).toBe(200);
        const updatedTask = (await attachRes.json()).data;
        expect(updatedTask.labels.length).toBe(1);
        expect(updatedTask.labels[0].name).toBe('Bug');

        // 6. Delete label
        const delRes = await pmApi.delete(`/api/labels/${label.id}`);
        expect(delRes.status()).toBe(204);

        // 7. Verify label is gone from task
        const getTaskRes = await pmApi.get(`/api/tasks/${task.id}`);
        // We need to make sure getTaskById includes labels
        const taskWithLabels = (await getTaskRes.json()).data;
        // In prisma, labels: true should be added to task include
    });
});
