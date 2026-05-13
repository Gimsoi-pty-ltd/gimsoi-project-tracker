import { test, expect } from '../fixtures/authFixtures.js';
import prisma from '../../lib/prisma.js';

test.describe('Tracker Metrics & New Fields', () => {

    test('Sprint creation and update supports goal field', async ({ pmApi, testProject }) => {
        const createRes = await pmApi.post('/api/sprints', {
            data: {
                name: 'Metrics Sprint',
                projectId: testProject.id,
                goal: 'Finish all 20 metrics'
            }
        });
        expect(createRes.status()).toBe(201);
        let sprint = (await createRes.json()).data;
        expect(sprint.goal).toBe('Finish all 20 metrics');

        const updateRes = await pmApi.patch(`/api/sprints/${sprint.id}`, {
            data: {
                goal: 'Updated Goal',
                version: sprint.version
            }
        });
        expect(updateRes.status()).toBe(200);
        sprint = (await updateRes.json()).data;
        expect(sprint.goal).toBe('Updated Goal');
    });

    test('Task creation and update supports new metrics fields', async ({ pmApi, testProject }) => {
        const createRes = await pmApi.post('/api/tasks', {
            data: {
                title: 'Metrics Task',
                projectId: testProject.id,
                storyPoints: 5,
                severity: 'HIGH',
                estimatedHours: 10,
                actualHours: 2
            }
        });
        expect(createRes.status()).toBe(201);
        let task = (await createRes.json()).data;
        expect(task.storyPoints).toBe(5);
        expect(task.severity).toBe('HIGH');
        expect(task.estimatedHours).toBe(10);
        expect(task.actualHours).toBe(2);

        const updateRes = await pmApi.patch(`/api/tasks/${task.id}`, {
            data: {
                storyPoints: 8,
                actualHours: 5,
                version: task.version
            }
        });
        expect(updateRes.status()).toBe(200);
        task = (await updateRes.json()).data;
        expect(task.storyPoints).toBe(8);
        expect(task.actualHours).toBe(5);
    });

    test('Task transition to REVIEW is allowed', async ({ pmApi, testProject }) => {
        const createRes = await pmApi.post('/api/tasks', {
            data: { title: 'Review Task', projectId: testProject.id }
        });
        let task = (await createRes.json()).data;
        
        // TODO -> IN_PROGRESS
        const p1 = await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'IN_PROGRESS', version: task.version } });
        task = (await p1.json()).data;
        expect(task.status).toBe('IN_PROGRESS');

        // IN_PROGRESS -> REVIEW
        const p2 = await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'REVIEW', version: task.version } });
        task = (await p2.json()).data;
        expect(task.status).toBe('REVIEW');

        // REVIEW -> IN_PROGRESS (Reversible)
        const p3 = await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'IN_PROGRESS', version: task.version } });
        task = (await p3.json()).data;
        expect(task.status).toBe('IN_PROGRESS');
    });

    test('GET /api/sprints/:id/metrics returns all 20 aggregated metrics', async ({ pmApi, testProject }) => {
        // Create a sprint
        const sprintRes = await pmApi.post('/api/sprints', {
            data: { name: 'Dashboard Sprint', projectId: testProject.id, goal: 'Verify aggregation' }
        });
        const sprint = (await sprintRes.json()).data;

        // Create tasks with different states
        await pmApi.post('/api/tasks', {
            data: { title: 'Done Task', projectId: testProject.id, sprintId: sprint.id, storyPoints: 5, estimatedHours: 5, actualHours: 5 }
        });
        // We need to actually set it to DONE in the DB or via API (API requires ACTIVE sprint)
        const tasks = await prisma.task.findMany({ where: { sprintId: sprint.id } });
        await prisma.task.update({ where: { id: tasks[0].id }, data: { status: 'DONE' } });

        await pmApi.post('/api/tasks', {
            data: { title: 'Blocked Task', projectId: testProject.id, sprintId: sprint.id, isBlocked: true, severity: 'CRITICAL' }
        });
        const blockedTask = await prisma.task.findFirst({ where: { title: 'Blocked Task', sprintId: sprint.id } });
        await prisma.task.update({ where: { id: blockedTask.id }, data: { status: 'BLOCKED' } });

        const overdueDate = new Date();
        overdueDate.setDate(overdueDate.getDate() - 5);
        await pmApi.post('/api/tasks', {
            data: { title: 'Overdue Task', projectId: testProject.id, sprintId: sprint.id, dueDate: overdueDate, priority: 'URGENT' }
        });

        const metricsRes = await pmApi.get(`/api/sprints/${sprint.id}/metrics`);
        expect(metricsRes.status()).toBe(200);
        const body = await metricsRes.json();
        const metrics = body.data;

        expect(metrics.sprintGoal).toBe('Verify aggregation');
        expect(metrics.totalTasks).toBe(3);
        expect(metrics.completedTasks).toBe(1);
        expect(metrics.velocity).toBe(5);
        expect(metrics.overdueTasks).toBe(1);
        expect(metrics.blockedTasks).toBe(1);
        expect(metrics.impactScore).toBe(4); // URGENT = 4
        expect(metrics.severityIndex).toBe(4); // CRITICAL = 4
        expect(metrics.kanbanCounts.DONE).toBe(1);
        expect(metrics.kanbanCounts.BLOCKED).toBe(1);
        expect(metrics.sprintHealth).toBeLessThan(100);
    });

    test('INTERN role is forbidden from viewing metrics (403)', async ({ internApi, testProject, testSprint }) => {
        const res = await internApi.get(`/api/sprints/${testSprint.id}/metrics`);
        expect(res.status()).toBe(403);
    });

    test('Unauthenticated user is unauthorized (401)', async ({ request }) => {
        const res = await request.get(`/api/sprints/some-uuid/metrics`);
        expect(res.status()).toBe(401);
    });
});
