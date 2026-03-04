import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Project Lifecycle & Ownership Validation', () => {

    test('PM can create a project under an existing client', async ({ pmApi, testClient }) => {
        const response = await pmApi.post('/api/projects', {
            data: {
                name: "PM Target Validation Project",
                clientId: testClient.id
            }
        });

        expect(response.status()).toBe(201);
        const json = await response.json();
        expect(json.data.status).toBe('DRAFT');
        expect(json.data.id).toBeDefined();
    });

    test('Intern gets 403 when modifying a PM project', async ({ internApi, testProject }) => {
        const response = await internApi.patch(`/api/projects/${testProject.id}`, {
            data: { name: "Hacked Name" }
        });

        expect(response.status()).toBe(403);
    });

    test('PM can successfully activate a DRAFT project', async ({ pmApi, testProject }) => {
        const response = await pmApi.patch(`/api/projects/${testProject.id}`, {
            data: { status: "ACTIVE" }
        });

        expect(response.status()).toBe(200);
        const json = await response.json();
        expect(json.data.status).toBe('ACTIVE');
    });

    test('Illegal State Transition prevents COMPLETED project from regressing to DRAFT', async ({ pmApi, testProject }) => {
        // First transition DRAFT -> COMPLETED
        let response = await pmApi.patch(`/api/projects/${testProject.id}`, {
            data: { status: "COMPLETED" }
        });
        expect(response.status()).toBe(200);

        // Attempt to illegally regress COMPLETED -> DRAFT
        response = await pmApi.patch(`/api/projects/${testProject.id}`, {
            data: { status: "DRAFT" }
        });

        expect(response.status()).toBe(400);
        const json = await response.json();
        expect(json.message).toContain('Illegal project state transition');
    });

    test('Cannot create sprint inside a COMPLETED project', async ({ pmApi, testClient }) => {
        // Create a fresh project and immediately complete it
        const projRes = await pmApi.post('/api/projects', {
            data: { name: `Completed Project ${Date.now()}`, clientId: testClient.id }
        });
        expect(projRes.status()).toBe(201);
        const project = (await projRes.json()).data;

        await pmApi.patch(`/api/projects/${project.id}`, { data: { status: 'COMPLETED' } });

        // Attempt to create a sprint inside the now-COMPLETED project
        const sprintRes = await pmApi.post('/api/sprints', {
            data: { name: 'Illegal Sprint', projectId: project.id }
        });

        expect(sprintRes.status()).toBe(400);
        const json = await sprintRes.json();
        expect(json.message).toContain('Cannot create a sprint inside a COMPLETED project');
    });

    test('GET /api/projects/:id/progress returns correct shape', async ({ pmApi, testClient }) => {
        // Create a project with a known task breakdown
        const projRes = await pmApi.post('/api/projects', {
            data: { name: `Progress Project ${Date.now()}`, clientId: testClient.id }
        });
        const project = (await projRes.json()).data;

        // Activate so we can create sprints → tasks
        await pmApi.patch(`/api/projects/${project.id}`, { data: { status: 'ACTIVE' } });
        const sprintRes = await pmApi.post('/api/sprints', {
            data: { name: 'Progress Sprint', projectId: project.id }
        });
        const sprint = (await sprintRes.json()).data;

        // Create 2 tasks; mark 1 DONE
        const t1Res = await pmApi.post('/api/tasks', {
            data: { title: 'Task 1', projectId: project.id, sprintId: sprint.id }
        });
        const t1 = (await t1Res.json()).data;

        await pmApi.post('/api/tasks', {
            data: { title: 'Task 2', projectId: project.id, sprintId: sprint.id }
        });

        await pmApi.put(`/api/tasks/${t1.id}`, { data: { status: 'DONE' } });

        // Assert progress shape
        const progRes = await pmApi.get(`/api/projects/${project.id}/progress`);
        expect(progRes.status()).toBe(200);
        const json = await progRes.json();
        expect(json.data).toMatchObject({
            TODO: 1,
            IN_PROGRESS: 0,
            DONE: 1,
            total: 2,
            percentComplete: 50,
        });
    });

    test('GET /api/projects/:id/progress returns 404 for unknown project', async ({ pmApi }) => {
        const res = await pmApi.get('/api/projects/non-existent-id-xyz/progress');
        expect(res.status()).toBe(404);
    });

    test('GET /api/projects returns nextCursor when more pages exist', async ({ pmApi, testClient }) => {
        // Create 2 projects to guarantee at least 2 records exist, then fetch with limit=1
        await pmApi.post('/api/projects', {
            data: { name: `Cursor Project A ${Date.now()}`, clientId: testClient.id }
        });
        await pmApi.post('/api/projects', {
            data: { name: `Cursor Project B ${Date.now()}`, clientId: testClient.id }
        });

        const res = await pmApi.get('/api/projects?limit=1');
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.data.length).toBe(1);
        expect(json.nextCursor).not.toBeNull();
        expect(typeof json.nextCursor).toBe('string');

        // Fetch the next page using the cursor
        const page2 = await pmApi.get(`/api/projects?limit=1&cursor=${json.nextCursor}`);
        expect(page2.status()).toBe(200);
        const json2 = await page2.json();
        expect(json2.data.length).toBeGreaterThanOrEqual(1);
        // The records on page 2 must be different from page 1
        expect(json2.data[0].id).not.toBe(json.data[0].id);
    });

});
