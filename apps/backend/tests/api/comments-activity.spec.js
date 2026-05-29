import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Task Comments & Activity API', () => {
    test('User can comment on a task and see activity log', async ({ pmApi, testProject, adminApi }) => {
        // 1. Create a task
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Comment Test Task', projectId: testProject.id }
        });
        expect(taskRes.status()).toBe(201);
        const { data: task } = await taskRes.json();

        // 2. Add a comment
        const commentRes = await pmApi.post(`/api/tasks/${task.id}/comments`, {
            data: { content: 'This is a test comment' }
        });
        expect(commentRes.status()).toBe(201);
        const { data: comment } = await commentRes.json();
        expect(comment.content).toBe('This is a test comment');

        // 3. List comments
        const listCommentsRes = await pmApi.get(`/api/tasks/${task.id}/comments`);
        expect(listCommentsRes.status()).toBe(200);
        const comments = (await listCommentsRes.json()).data;
        expect(comments.length).toBeGreaterThan(0);
        expect(comments[0].content).toBe('This is a test comment');

        // 4. Update task (Status change)
        // First, need a sprint to set to ACTIVE if we want to go to DONE, but let's just go to IN_PROGRESS
        const updateRes = await pmApi.patch(`/api/tasks/${task.id}`, {
            data: { status: 'IN_PROGRESS', version: task.version }
        });
        expect(updateRes.status()).toBe(200);

        // 5. Check activity log
        const activityRes = await pmApi.get(`/api/tasks/${task.id}/activities`);
        expect(activityRes.status()).toBe(200);
        const activities = (await activityRes.json()).data;
        
        // Should have CREATED and STATUS_CHANGE
        expect(activities.some(a => a.action === 'CREATED')).toBe(true);
        expect(activities.some(a => a.action === 'STATUS_CHANGE')).toBe(true);
        
        const statusChange = activities.find(a => a.action === 'STATUS_CHANGE');
        expect(JSON.parse(statusChange.newValue)).toBe('IN_PROGRESS');
    });

    test('Non-member cannot comment on a task', async ({ internApi, testProject, pmApi, adminApi }) => {
        // PM creates task
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Private Task', projectId: testProject.id }
        });
        const { data: task } = await taskRes.json();

        // Intern (not a member) attempts to comment
        const commentRes = await internApi.post(`/api/tasks/${task.id}/comments`, {
            data: { content: 'Illegal comment' }
        });
        expect(commentRes.status()).toBe(403);
    });

    test('User can delete their own comment', async ({ pmApi, testProject }) => {
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Delete Comment Task', projectId: testProject.id }
        });
        const { data: task } = await taskRes.json();

        const commentRes = await pmApi.post(`/api/tasks/${task.id}/comments`, {
            data: { content: 'Going away soon' }
        });
        const { data: comment } = await commentRes.json();

        const delRes = await pmApi.delete(`/api/comments/${comment.id}`);
        expect(delRes.status()).toBe(204);

        const listRes = await pmApi.get(`/api/tasks/${task.id}/comments`);
        const comments = (await listRes.json()).data;
        expect(comments.some(c => c.id === comment.id)).toBe(false);
    });
});
