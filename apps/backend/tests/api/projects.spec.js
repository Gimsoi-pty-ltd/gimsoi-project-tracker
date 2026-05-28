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

        // Advance t1 through the legal path: TODO → IN_PROGRESS → DONE
        await pmApi.patch(`/api/tasks/${t1.id}`, { data: { status: 'IN_PROGRESS' } });
        await pmApi.patch(`/api/tasks/${t1.id}`, { data: { status: 'DONE' } });

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

    test('PM can create and update a project with description and endDate', async ({ pmApi, testClient }) => {
        // A. Create with description and endDate
        const endDateStr = "2026-12-31T00:00:00.000Z";
        const createRes = await pmApi.post('/api/projects', {
            data: {
                name: "TDD Project Metadata",
                clientId: testClient.id,
                description: "Initial description",
                endDate: endDateStr
            }
        });

        expect(createRes.status()).toBe(201);
        const created = (await createRes.json()).data;
        expect(created.description).toBe("Initial description");
        expect(created.endDate).toBe(endDateStr);

        // B. Update description via PATCH
        const updateRes = await pmApi.patch(`/api/projects/${created.id}`, {
            data: {
                description: "Updated description"
            }
        });

        expect(updateRes.status()).toBe(200);
        const updated = (await updateRes.json()).data;
        expect(updated.description).toBe("Updated description");
    });

    test('PM can search for projects by name or description using ?search= query parameter', async ({ pmApi, testClient }) => {
        // Create search target projects
        const projName1 = `Alpha Search Target ${Date.now()}`;
        const projName2 = `Beta Search Target ${Date.now()}`;
        
        const res1 = await pmApi.post('/api/projects', {
            data: {
                name: projName1,
                clientId: testClient.id,
                description: "DeepMind and Google technologies"
            }
        });
        expect(res1.status()).toBe(201);
        const p1 = (await res1.json()).data;

        const res2 = await pmApi.post('/api/projects', {
            data: {
                name: projName2,
                clientId: testClient.id,
                description: "Completely unrelated text"
            }
        });
        expect(res2.status()).toBe(201);
        const p2 = (await res2.json()).data;

        // 1. Search by name (case-insensitive)
        const searchNameRes = await pmApi.get(`/api/projects?search=alpha`);
        expect(searchNameRes.status()).toBe(200);
        const nameJson = await searchNameRes.json();
        // Check if p1 is present and p2 is NOT present
        const hasP1 = nameJson.data.some(p => p.id === p1.id);
        const hasP2 = nameJson.data.some(p => p.id === p2.id);
        expect(hasP1).toBe(true);
        expect(hasP2).toBe(false);

        // 2. Search by description (case-insensitive)
        const searchDescRes = await pmApi.get(`/api/projects?search=deepmind`);
        expect(searchDescRes.status()).toBe(200);
        const descJson = await searchDescRes.json();
        const hasP1Desc = descJson.data.some(p => p.id === p1.id);
        const hasP2Desc = descJson.data.some(p => p.id === p2.id);
        expect(hasP1Desc).toBe(true);
        expect(hasP2Desc).toBe(false);
    });

    test('PM can delete a project and subsequent GET returns 404', async ({ pmApi, testClient }) => {
        // Create a project
        const createRes = await pmApi.post('/api/projects', {
            data: { name: `Deletable Project ${Date.now()}`, clientId: testClient.id }
        });
        expect(createRes.status()).toBe(201);
        const project = (await createRes.json()).data;

        // Delete the project
        const delRes = await pmApi.delete(`/api/projects/${project.id}`);
        expect(delRes.status()).toBe(204);

        // Verify it no longer exists
        const getRes = await pmApi.get(`/api/projects/${project.id}`);
        expect(getRes.status()).toBe(404);
    });

});
