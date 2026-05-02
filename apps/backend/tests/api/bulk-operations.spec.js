import { test, expect } from '../fixtures/authFixtures.js';
import prisma from '../../lib/prisma.js';
import { TASK_STATUS, PROJECT_STATUS } from '../../constants/statuses.js';

test.describe('Bulk Operations & Archiving API', () => {
    let adminApi;
    let pmApi;
    let clientApi; // For testing read access
    let testProject;
    let testSprint;
    let testTasks = [];
    
    test.beforeAll(async ({ adminApi, pmApi: pm }) => {
        pmApi = pm;

        // 1. Create a client
        const clientRes = await adminApi.post('/api/clients', {
            data: { name: 'Bulk Client', contactEmail: 'bulk@test.com' }
        });
        const clientBody = await clientRes.json();
        const clientId = clientBody.data.id;

        // 2. Create a project
        const projectRes = await adminApi.post('/api/projects', {
            data: { name: 'Bulk Test Project', clientId, status: 'ACTIVE' }
        });
        testProject = (await projectRes.json()).data;

        // 2. Create a sprint
        const sprintRes = await adminApi.post('/api/sprints', {
            data: { name: 'Bulk Sprint 1', projectId: testProject.id, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000).toISOString() }
        });
        testSprint = (await sprintRes.json()).data;

        // 3. Create 3 tasks
        for (let i = 0; i < 3; i++) {
            const taskRes = await adminApi.post('/api/tasks', {
                data: { title: `Bulk Task ${i}`, projectId: testProject.id, sprintId: testSprint.id }
            });
            testTasks.push((await taskRes.json()).data);
        }
    });

    test('Bulk update task statuses', async ({ adminApi }) => {
        // Fetch current versions
        const fetchRes = await adminApi.get(`/api/tasks?projectId=${testProject.id}`);
        const currentTasks = (await fetchRes.json()).data;

        const payload = {
            data: {
                tasks: currentTasks.map(t => ({ id: t.id, version: t.version })),
                updateData: {
                    status: TASK_STATUS.IN_PROGRESS
                }
            }
        };

        const updateRes = await adminApi.patch(`/api/projects/${testProject.id}/tasks/bulk`, payload);
        const updateData = await updateRes.json();
        expect(updateRes.status()).toBe(200);
        expect(updateData.success).toBe(true);
        expect(updateData.data.count).toBe(3);

        // Verify status
        const verifyRes = await adminApi.get(`/api/tasks?projectId=${testProject.id}`);
        const updatedTasks = (await verifyRes.json()).data;
        expect(updatedTasks.every(t => t.status === TASK_STATUS.IN_PROGRESS)).toBe(true);
    });

    test('Bulk update fails on version mismatch', async ({ adminApi }) => {
        // We simulate a race condition by passing an old version
        const fetchRes = await adminApi.get(`/api/tasks?projectId=${testProject.id}`);
        const currentTasks = (await fetchRes.json()).data;

        const payload = {
            data: {
                tasks: currentTasks.map((t, i) => ({ id: t.id, version: i === 0 ? t.version + 999 : t.version })),
                updateData: {
                    priority: 'HIGH'
                }
            }
        };

        const updateRes = await adminApi.patch(`/api/projects/${testProject.id}/tasks/bulk`, payload);
        expect(updateRes.status()).toBe(409); // Conflict error
    });

    test('Bulk delete tasks', async ({ adminApi }) => {
        const fetchRes = await adminApi.get(`/api/tasks?projectId=${testProject.id}`);
        const currentTasks = (await fetchRes.json()).data;

        // We'll delete 2 tasks
        const tasksToDelete = currentTasks.slice(0, 2);
        
        const payload = {
            data: {
                tasks: tasksToDelete.map(t => ({ id: t.id, version: t.version }))
            }
        };

        const deleteRes = await adminApi.delete(`/api/projects/${testProject.id}/tasks/bulk`, payload);
        expect(deleteRes.status()).toBe(200);

        const verifyRes = await adminApi.get(`/api/tasks?projectId=${testProject.id}`);
        const remainingTasks = (await verifyRes.json()).data;
        expect(remainingTasks.length).toBe(1);
        expect(remainingTasks[0].id).toBe(currentTasks[2].id);
    });

    test('Archive project', async ({ adminApi }) => {
        const updateRes = await adminApi.patch(`/api/projects/${testProject.id}`, {
            data: {
                status: PROJECT_STATUS.ARCHIVED,
                version: testProject.version
            }
        });
        expect(updateRes.status()).toBe(200);
        const data = await updateRes.json();
        expect(data.data.status).toBe(PROJECT_STATUS.ARCHIVED);

        // Verify it doesn't show up in default list
        const listRes = await adminApi.get(`/api/projects`);
        const projects = (await listRes.json()).data;
        const found = projects.find(p => p.id === testProject.id);
        expect(found).toBeUndefined();

        // Verify it shows up when including archived
        const listArchivedRes = await adminApi.get(`/api/projects?includeArchived=true`);
        const allProjects = (await listArchivedRes.json()).data;
        const foundArchived = allProjects.find(p => p.id === testProject.id);
        expect(foundArchived).toBeDefined();
        expect(foundArchived.status).toBe(PROJECT_STATUS.ARCHIVED);
    });
});
