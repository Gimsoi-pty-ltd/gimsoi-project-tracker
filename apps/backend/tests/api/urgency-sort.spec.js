import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Urgency Sort API', () => {
    let projectId;
    let clientId;
    let sprintId;

    test.beforeAll(async ({ adminApi }) => {
        // Create client
        const clientRes = await adminApi.post('/api/clients', {
            data: { name: `Urgency Client ${Date.now()}`, contactEmail: `urgency-${Date.now()}@test.com` }
        });
        clientId = (await clientRes.json()).data.id;

        // Create project
        const projectRes = await adminApi.post('/api/projects', {
            data: { name: `Urgency Project ${Date.now()}`, clientId, status: 'ACTIVE' }
        });
        projectId = (await projectRes.json()).data.id;

        // Create sprint
        const sprintRes = await adminApi.post('/api/sprints', {
            data: { 
                name: 'Urgency Sprint', 
                projectId, 
                startDate: new Date().toISOString(), 
                endDate: new Date(Date.now() + 86400000).toISOString(),
                status: 'ACTIVE'
            }
        });
        sprintId = (await sprintRes.json()).data.id;
    });

    test('Tasks are sorted by urgency score correctly', async ({ adminApi }) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);

        // 1. Create a set of tasks with different urgency levels
        await adminApi.post('/api/tasks', {
            data: { 
                title: 'Task A', projectId, sprintId, priority: 'URGENT', 
                dueDate: lastWeek.toISOString(), isBlocked: true 
            }
        });

        await adminApi.post('/api/tasks', {
            data: { 
                title: 'Task B', projectId, sprintId, priority: 'HIGH', 
                dueDate: yesterday.toISOString(), isBlocked: false 
            }
        });

        await adminApi.post('/api/tasks', {
            data: { 
                title: 'Task C', projectId, sprintId, priority: 'LOW', 
                dueDate: today.toISOString(), isBlocked: false 
            }
        });

        // 2. Fetch with sortBy=urgency
        const res = await adminApi.get(`/api/tasks?projectId=${projectId}&sortBy=urgency`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        const tasks = body.data;

        // Check order: A (64) > B (9) > C (1)
        expect(tasks[0].title).toBe('Task A');
        expect(tasks[1].title).toBe('Task B');
        expect(tasks[2].title).toBe('Task C');

        // Check urgencyScore field presence
        expect(tasks[0].urgencyScore).toBe(64);
        expect(tasks[0]).toHaveProperty('phase');
    });

    test('Default sort is unchanged when sortBy is not provided', async ({ adminApi }) => {
        // Create one task
        await adminApi.post('/api/tasks', {
            data: { title: 'Default Task', projectId, sprintId }
        });

        const res = await adminApi.get(`/api/tasks?projectId=${projectId}`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        const tasks = body.data;

        expect(tasks.length).toBeGreaterThan(0);
        expect(tasks[0].urgencyScore).toBeUndefined();
        expect(tasks[0].phase).toBeUndefined();
    });

    test('Terminal statuses have 0 days overdue contribution', async ({ adminApi }) => {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        // Task D: URGENT, 7 days overdue but DONE
        // Score = 4 * (0 + 1) * 1.0 = 4 (daysOverdue is 0)
        const taskRes = await adminApi.post('/api/tasks', {
            data: { 
                title: 'Task D', projectId, sprintId, priority: 'URGENT', 
                dueDate: lastWeek.toISOString()
            }
        });
        const task = (await taskRes.json()).data;

        // Mark as IN_PROGRESS then DONE
        const patch1 = await adminApi.patch(`/api/tasks/${task.id}`, {
            data: { status: 'IN_PROGRESS', version: task.version }
        });
        expect(patch1.status()).toBe(200);

        const patch2 = await adminApi.patch(`/api/tasks/${task.id}`, {
            data: { status: 'DONE', version: task.version + 1 }
        });
        expect(patch2.status()).toBe(200);

        const res = await adminApi.get(`/api/tasks?projectId=${projectId}&sortBy=urgency`);
        const tasks = (await res.json()).data;
        const taskD = tasks.find(t => t.title === 'Task D');
        
        expect(taskD.urgencyScore).toBe(4);
    });
});
