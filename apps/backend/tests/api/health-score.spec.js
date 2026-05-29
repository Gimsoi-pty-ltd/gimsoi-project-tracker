import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Health Score API', () => {
    let projectId;
    let clientId;
    let sprintId;
    let phaseId;

    test.beforeAll(async ({ adminApi }) => {
        // Create client
        const clientRes = await adminApi.post('/api/clients', {
            data: { name: `Health Client ${Date.now()}`, contactEmail: `health-${Date.now()}@test.com` }
        });
        clientId = (await clientRes.json()).data.id;

        // Create project
        const projectRes = await adminApi.post('/api/projects', {
            data: { name: `Health Project ${Date.now()}`, clientId, status: 'ACTIVE' }
        });
        projectId = (await projectRes.json()).data.id;

        // Create phase
        const phaseRes = await adminApi.post('/api/phases', {
            data: { name: 'Health Phase', projectId }
        });
        phaseId = (await phaseRes.json()).data.id;

        // Create sprint
        const sprintRes = await adminApi.post('/api/sprints', {
            data: { 
                name: 'Health Sprint', 
                projectId, 
                startDate: new Date().toISOString(), 
                endDate: new Date(Date.now() + 86400000).toISOString(),
                status: 'ACTIVE'
            }
        });
        sprintId = (await sprintRes.json()).data.id;
    });

    test('Project health score factors in completion, blocked, and overdue tasks', async ({ adminApi }) => {
        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);

        // 1. Create 4 tasks:
        // - Task 1: DONE (adds 25% to base score)
        // - Task 2: BLOCKED (-10 penalty)
        // - Task 3: OVERDUE (-5 penalty)
        // - Task 4: TODO (0 contribution)
        
        // Task 1: DONE
        const t1Res = await adminApi.post('/api/tasks', {
            data: { title: 'T1', projectId, sprintId, priority: 'MEDIUM' }
        });
        const t1 = (await t1Res.json()).data;
        await adminApi.patch(`/api/tasks/${t1.id}`, { data: { status: 'IN_PROGRESS', version: t1.version } });
        await adminApi.patch(`/api/tasks/${t1.id}`, { data: { status: 'DONE', version: t1.version + 1 } });

        // Task 2: BLOCKED
        await adminApi.post('/api/tasks', {
            data: { title: 'T2', projectId, sprintId, priority: 'MEDIUM', isBlocked: true }
        });

        // Task 3: OVERDUE
        await adminApi.post('/api/tasks', {
            data: { title: 'T3', projectId, sprintId, priority: 'MEDIUM', dueDate: lastWeek.toISOString() }
        });

        // Task 4: TODO
        await adminApi.post('/api/tasks', {
            data: { title: 'T4', projectId, sprintId, priority: 'MEDIUM' }
        });

        // 2. Fetch project summary
        const res = await adminApi.get(`/api/tasks/projects/${projectId}/summary`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        const summary = body.data;

        // Base score = (1/4) * 100 = 25
        // Penalty = (1 overdue * 5) + (1 blocked * 10) = 15
        // Health score = 25 - 15 = 10
        expect(summary.percentComplete).toBe(25);
        expect(summary.blockedCount).toBe(1);
        expect(summary.overdueCount).toBe(1);
        expect(summary.healthScore).toBe(10);
    });

    test('Phase health score factors in completion, blocked, and overdue tasks', async ({ adminApi }) => {
        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);

        // Create a new phase for isolation
        const phaseRes = await adminApi.post('/api/phases', {
            data: { name: 'Drill Down Phase', projectId }
        });
        const drillPhaseId = (await phaseRes.json()).data.id;

        // 1. Create 2 tasks in this phase:
        // - Task 5: DONE (adds 50% to base score)
        // - Task 6: BLOCKED (-10 penalty)
        
        const t5Res = await adminApi.post('/api/tasks', {
            data: { title: 'T5', projectId, sprintId, phaseId: drillPhaseId, priority: 'MEDIUM' }
        });
        const t5 = (await t5Res.json()).data;
        await adminApi.patch(`/api/tasks/${t5.id}`, { data: { status: 'IN_PROGRESS', version: t5.version } });
        await adminApi.patch(`/api/tasks/${t5.id}`, { data: { status: 'DONE', version: t5.version + 1 } });

        await adminApi.post('/api/tasks', {
            data: { title: 'T6', projectId, sprintId, phaseId: drillPhaseId, priority: 'MEDIUM', isBlocked: true }
        });

        // 2. Fetch phase milestone status
        const res = await adminApi.get(`/api/phases/${drillPhaseId}/milestone`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        const milestone = body.data;

        // Base score = (1/2) * 100 = 50
        // Penalty = (0 overdue * 5) + (1 blocked * 10) = 10
        // Health score = 50 - 10 = 40
        expect(milestone.percentComplete).toBe(50);
        expect(milestone.taskCounts.blockedCount).toBe(1);
        expect(milestone.healthScore).toBe(40);
    });
});
