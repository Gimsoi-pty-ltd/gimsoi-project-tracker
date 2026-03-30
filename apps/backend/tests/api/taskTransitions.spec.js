import { test, expect } from '../fixtures/authFixtures.js';
import { ALLOWED_TRANSITIONS } from '../../services/task.service.js';

test.describe('Task State Transition Validation (Objective 1)', () => {

    test('Contract: ALLOWED_TRANSITIONS is defined and is an object', async () => {
        expect(ALLOWED_TRANSITIONS).toBeDefined();
        expect(typeof ALLOWED_TRANSITIONS).toBe('object');
        expect(ALLOWED_TRANSITIONS.TODO).toContain('IN_PROGRESS');
    });

    test('Baseline: ALLOWED_TRANSITIONS is enforced (regression test)', async ({ pmApi, testProject, testSprint }) => {

        // 1. Create task
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Transition Baseline Task', projectId: testProject.id, sprintId: testSprint.id }
        });
        expect(taskRes.status()).toBe(201);
        const task = (await taskRes.json()).data;

        // 2. Test valid transition: TODO -> IN_PROGRESS
        const validRes = await pmApi.patch(`/api/tasks/${task.id}`, {
            data: { status: 'IN_PROGRESS' }
        });
        expect(validRes.status()).toBe(200);
    });

    test('Illegal transition: DONE -> IN_PROGRESS is blocked', async ({ pmApi, testProject, testSprint }) => {
        // 1. Create and complete task
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Illegal Regression Task', projectId: testProject.id, sprintId: testSprint.id }
        });
        const task = (await taskRes.json()).data;

        await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'IN_PROGRESS' } });
        
        // Activate sprint before moving to DONE (Phase 3 requirement)
        await pmApi.patch(`/api/sprints/${testSprint.id}/status`, { data: { status: 'ACTIVE' } });
        await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'DONE' } });

        // 2. Attempt illegal move DONE -> IN_PROGRESS
        const failRes = await pmApi.patch(`/api/tasks/${task.id}`, {
            data: { status: 'IN_PROGRESS' }
        });

        expect(failRes.status()).toBe(400);
        const body = await failRes.json();
        expect(body.message).toContain('Cannot modify'); // Current error message in task.service.js:158
    });

    test('Illegal transition: TODO -> DONE is blocked (jumps IN_PROGRESS)', async ({ pmApi, testProject, testSprint }) => {
        // 1. Create task (TODO)
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Jump Transition Task', projectId: testProject.id, sprintId: testSprint.id }
        });
        const task = (await taskRes.json()).data;

        // 2. Attempt illegal move TODO -> DONE
        const failRes = await pmApi.patch(`/api/tasks/${task.id}`, {
            data: { status: 'DONE' }
        });

        expect(failRes.status()).toBe(400);
        const body = await failRes.json();
        expect(body.message).toContain('Illegal task transition'); // Current error message in task.service.js:172
    });

    test('Valid transition: TODO -> CANCELLED', async ({ pmApi, testProject, testSprint }) => {
        const createRes = await pmApi.post('/api/tasks', {
            data: { title: 'To Cancel from TODO', projectId: testProject.id, sprintId: testSprint.id }
        });
        const task = (await createRes.json()).data;

        const res = await pmApi.patch(`/api/tasks/${task.id}`, {
            data: { status: 'CANCELLED' }
        });
        if (res.status() !== 200) console.error('PATCH FAIL:', await res.json());
        expect(res.status()).toBe(200);
        expect((await res.json()).data.status).toBe('CANCELLED');
    });

    test('Valid transition: IN_PROGRESS -> CANCELLED', async ({ pmApi, testProject, testSprint }) => {
        const createRes = await pmApi.post('/api/tasks', {
            data: { title: 'To Cancel from IN_PROGRESS', projectId: testProject.id, sprintId: testSprint.id }
        });
        const task = (await createRes.json()).data;
        await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'IN_PROGRESS' } });

        const res = await pmApi.patch(`/api/tasks/${task.id}`, {
            data: { status: 'CANCELLED' }
        });
        if (res.status() !== 200) console.error('PATCH FAIL:', await res.json());
        expect(res.status()).toBe(200);
        expect((await res.json()).data.status).toBe('CANCELLED');
    });

    test('Terminality: CANCELLED tasks cannot be updated', async ({ pmApi, testProject, testSprint }) => {
        const createRes = await pmApi.post('/api/tasks', {
            data: { title: 'Terminal Cancel Task', projectId: testProject.id, sprintId: testSprint.id }
        });
        const task = (await createRes.json()).data;
        await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'CANCELLED' } });

        // Attempt to move back to TODO
        const res = await pmApi.patch(`/api/tasks/${task.id}`, {
            data: { status: 'TODO' }
        });
        expect(res.status()).toBe(400);
        expect((await res.json()).message).toContain('CANCELLED');
    });

    test('Analytics: CANCELLED tasks appear in summary counts', async ({ pmApi, testProject, testSprint }) => {
        const createRes = await pmApi.post('/api/tasks', {
            data: { title: 'Summary Cancel Task', projectId: testProject.id, sprintId: testSprint.id }
        });
        const task = (await createRes.json()).data;
        await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'CANCELLED' } });

        const res = await pmApi.get(`/api/tasks/projects/${testProject.id}/summary`);
        expect(res.status()).toBe(200);
        const body = await res.json();

        // CANCELLED might not be explicitly in the summary object keys if not added to getProjectTaskSummary
        // I need to check task.service.js:209
        expect(body.data.CANCELLED).toBeDefined();
        expect(body.data.CANCELLED).toBeGreaterThan(0);
    });

    // --- PHASE 3 TESTS FOR BLOCKED STATE ---

    test('Valid transition: IN_PROGRESS -> BLOCKED', async ({ pmApi, testProject, testSprint }) => {
        const createRes = await pmApi.post('/api/tasks', {
            data: { title: 'To Block from IN_PROGRESS', projectId: testProject.id, sprintId: testSprint.id }
        });
        const task = (await createRes.json()).data;
        await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'IN_PROGRESS' } });

        const res = await pmApi.patch(`/api/tasks/${task.id}`, {
            data: { status: 'BLOCKED' }
        });
        expect(res.status()).toBe(200);
        expect((await res.json()).data.status).toBe('BLOCKED');
    });

    test('Valid transition: BLOCKED -> IN_PROGRESS (reversibility confirmed)', async ({ pmApi, testProject, testSprint }) => {
        const createRes = await pmApi.post('/api/tasks', {
            data: { title: 'Unblock Task', projectId: testProject.id, sprintId: testSprint.id }
        });
        const task = (await createRes.json()).data;
        await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'IN_PROGRESS' } });
        await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'BLOCKED' } });

        const res = await pmApi.patch(`/api/tasks/${task.id}`, {
            data: { status: 'IN_PROGRESS' }
        });
        expect(res.status()).toBe(200);
        expect((await res.json()).data.status).toBe('IN_PROGRESS');
    });

    test('Illegal transition: BLOCKED -> DONE is NOT a valid direct transition', async ({ pmApi, testProject, testSprint }) => {
        const createRes = await pmApi.post('/api/tasks', {
            data: { title: 'Illegal Block to Done Task', projectId: testProject.id, sprintId: testSprint.id }
        });
        const task = (await createRes.json()).data;
        await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'IN_PROGRESS' } });
        await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'BLOCKED' } });

        const failRes = await pmApi.patch(`/api/tasks/${task.id}`, {
            data: { status: 'DONE' }
        });
        expect(failRes.status()).toBe(400);
        const body = await failRes.json();
        expect(body.message).toContain('Illegal task transition');
    });

    test('Valid transition: BLOCKED -> CANCELLED', async ({ pmApi, testProject, testSprint }) => {
        const createRes = await pmApi.post('/api/tasks', {
            data: { title: 'Cancel from Blocked Task', projectId: testProject.id, sprintId: testSprint.id }
        });
        const task = (await createRes.json()).data;
        await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'IN_PROGRESS' } });
        await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'BLOCKED' } });

        const res = await pmApi.patch(`/api/tasks/${task.id}`, {
            data: { status: 'CANCELLED' }
        });
        expect(res.status()).toBe(200);
        expect((await res.json()).data.status).toBe('CANCELLED');
    });

    test('Reversibility: A task with status BLOCKED can still be updated', async ({ pmApi, testProject, testSprint }) => {
        const createRes = await pmApi.post('/api/tasks', {
            data: { title: 'Update Blocked Task Title', projectId: testProject.id, sprintId: testSprint.id }
        });
        const task = (await createRes.json()).data;
        await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'IN_PROGRESS' } });
        await pmApi.patch(`/api/tasks/${task.id}`, { data: { status: 'BLOCKED' } });

        // Update the title
        const editRes = await pmApi.patch(`/api/tasks/${task.id}`, { data: { title: 'New Title While Blocked' } });
        expect(editRes.status()).toBe(200);
        const editBody = await editRes.json();
        expect(editBody.data.title).toBe('New Title While Blocked');
    });
});

test.describe('Task Modification Guards (Objective 2)', () => {
    test('Updating a task on a COMPLETED project still throws the expected error', async ({ pmApi, testClient }) => {
        const projRes = await pmApi.post('/api/projects', {
            data: { name: 'Guard Project', clientId: testClient.id }
        });
        const projectId = (await projRes.json()).data.id;
        await pmApi.patch(`/api/projects/${projectId}`, { data: { status: 'ACTIVE' } });
        
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Guard Task', projectId }
        });
        const taskId = (await taskRes.json()).data.id;

        // Complete the project
        await pmApi.patch(`/api/projects/${projectId}`, { data: { status: 'COMPLETED' } });

        const editRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { title: 'Updated' } });
        expect(editRes.status()).toBe(400);
        expect((await editRes.json()).message).toContain('COMPLETED');
    });

    test('Updating a DONE task still throws the expected error', async ({ pmApi, testProject, testSprint }) => {
        const createRes = await pmApi.post('/api/tasks', {
            data: { title: 'Done Task', projectId: testProject.id, sprintId: testSprint.id }
        });
        const taskId = (await createRes.json()).data.id;
        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'IN_PROGRESS' } });
        
        // Activate sprint before moving to DONE (Phase 3 requirement)
        await pmApi.patch(`/api/sprints/${testSprint.id}/status`, { data: { status: 'ACTIVE' } });
        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'DONE' } });

        const editRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { title: 'Updated' } });
        expect(editRes.status()).toBe(400);
        expect((await editRes.json()).message).toContain('DONE');
    });

    test('Updating a CANCELLED task still throws the expected error', async ({ pmApi, testProject, testSprint }) => {
        const createRes = await pmApi.post('/api/tasks', {
            data: { title: 'Cancelled Task', projectId: testProject.id, sprintId: testSprint.id }
        });
        const taskId = (await createRes.json()).data.id;
        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'CANCELLED' } });

        const editRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { title: 'Updated' } });
        expect(editRes.status()).toBe(400);
        expect((await editRes.json()).message).toContain('CANCELLED');
    });

    test('Deleting a task on a COMPLETED project still throws the expected error', async ({ pmApi, adminApi, testClient }) => {
        const projRes = await pmApi.post('/api/projects', {
            data: { name: 'Delete Guard Project', clientId: testClient.id }
        });
        const projectId = (await projRes.json()).data.id;
        await pmApi.patch(`/api/projects/${projectId}`, { data: { status: 'ACTIVE' } });
        
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'To Delete Task', projectId }
        });
        const taskId = (await taskRes.json()).data.id;

        // Complete the project
        await pmApi.patch(`/api/projects/${projectId}`, { data: { status: 'COMPLETED' } });

        const delRes = await adminApi.delete(`/api/tasks/${taskId}`);
        expect(delRes.status()).toBe(400);
        expect((await delRes.json()).message).toContain('COMPLETED');
    });

    test('A valid update on an active task and project still succeeds', async ({ pmApi, testProject, testSprint }) => {
        const createRes = await pmApi.post('/api/tasks', {
            data: { title: 'Valid Task', projectId: testProject.id, sprintId: testSprint.id }
        });
        const taskId = (await createRes.json()).data.id;

        const editRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { title: 'Valid Title Update' } });
        expect(editRes.status()).toBe(200);
        const body = await editRes.json();
        expect(body.data.title).toBe('Valid Title Update');
    });

    test('Updating a task whose sprint is CLOSED throws the expected error', async ({ pmApi, testProject }) => {
        const sprintRes = await pmApi.post('/api/sprints', {
            data: { name: 'Closed Sprint', projectId: testProject.id }
        });
        const sprintId = (await sprintRes.json()).data.id;
        
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'In Closed Sprint', projectId: testProject.id, sprintId }
        });
        const taskId = (await taskRes.json()).data.id;

        // Transition sprint to ACTIVE then set task to DONE (Phase 3 requirement)
        await pmApi.patch(`/api/sprints/${sprintId}/status`, { data: { status: 'ACTIVE' } });
        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'IN_PROGRESS' } });
        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'DONE' } });

        // Correctly transition the sprint to CLOSED.
        const closeRes = await pmApi.patch(`/api/sprints/${sprintId}/status`, { data: { status: 'CLOSED' } });
        expect(closeRes.status()).toBe(200);

        const editRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { title: 'Updated' } });
        expect(editRes.status()).toBe(400);
        const body = await editRes.json();
        expect(body.message.toLowerCase()).toContain('closed sprint');
    });

    test('Deleting a task whose sprint is CLOSED throws the expected error', async ({ pmApi, adminApi, testProject }) => {
        const sprintRes = await pmApi.post('/api/sprints', {
            data: { name: 'Closed Sprint Delete', projectId: testProject.id }
        });
        const sprintId = (await sprintRes.json()).data.id;
        
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'To Delete in Closed', projectId: testProject.id, sprintId }
        });
        const taskId = (await taskRes.json()).data.id;

        // Transition sprint to ACTIVE then set task to DONE (Phase 3 requirement)
        await pmApi.patch(`/api/sprints/${sprintId}/status`, { data: { status: 'ACTIVE' } });
        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'IN_PROGRESS' } });
        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'DONE' } });

        // Correctly transition the sprint to CLOSED.
        const closeRes = await pmApi.patch(`/api/sprints/${sprintId}/status`, { data: { status: 'CLOSED' } });
        expect(closeRes.status()).toBe(200);

        const delRes = await adminApi.delete(`/api/tasks/${taskId}`);
        expect(delRes.status()).toBe(400);
        const body = await delRes.json();
        expect(body.message.toLowerCase()).toContain('closed sprint');
    });

    test('Updating a task whose sprint is ACTIVE succeeds', async ({ pmApi, testProject }) => {
        const sprintRes = await pmApi.post('/api/sprints', {
            data: { name: 'Active Sprint', projectId: testProject.id }
        });
        const sprintId = (await sprintRes.json()).data.id;
        await pmApi.patch(`/api/sprints/${sprintId}`, { data: { status: 'ACTIVE' } });

        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'In Active Sprint', projectId: testProject.id, sprintId }
        });
        const taskId = (await taskRes.json()).data.id;

        const editRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { title: 'Valid Update' } });
        expect(editRes.status()).toBe(200);
    });

    test('Deleting a task whose sprint is ACTIVE succeeds', async ({ pmApi, adminApi, testProject }) => {
        const sprintRes = await pmApi.post('/api/sprints', {
            data: { name: 'Active Sprint Delete', projectId: testProject.id }
        });
        const sprintId = (await sprintRes.json()).data.id;
        await pmApi.patch(`/api/sprints/${sprintId}`, { data: { status: 'ACTIVE' } });

        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'To Delete in Active', projectId: testProject.id, sprintId }
        });
        const taskId = (await taskRes.json()).data.id;

        const delRes = await adminApi.delete(`/api/tasks/${taskId}`);
        expect(delRes.status()).toBe(200);
    });

    test('A task with no sprint (sprint === null) is unaffected by the closed sprint guard', async ({ pmApi, testProject }) => {
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'No Sprint Task', projectId: testProject.id }
        });
        const taskId = (await taskRes.json()).data.id;

        const editRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { title: 'Updated Title' } });
        expect(editRes.status()).toBe(200);
    });

    test('Transitioning a task to DONE when sprint is PLANNING throws the expected error', async ({ pmApi, testProject }) => {
        const sprintRes = await pmApi.post('/api/sprints', {
            data: { name: 'Planning Sprint', projectId: testProject.id }
        });
        const sprintId = (await sprintRes.json()).data.id;
        
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'To DONE in Planning', projectId: testProject.id, sprintId }
        });
        const taskId = (await taskRes.json()).data.id;

        const editRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'IN_PROGRESS' } });
        expect(editRes.status()).toBe(200);

        const doneRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'DONE' } });
        expect(doneRes.status()).toBe(400);
        const body = await doneRes.json();
        expect(body.message.toLowerCase()).toContain('active sprint');
    });

    test('Transitioning a task to DONE when sprint is CLOSED throws the expected error', async ({ pmApi, testProject }) => {
        const sprintRes = await pmApi.post('/api/sprints', {
            data: { name: 'Closed Sprint Done', projectId: testProject.id }
        });
        const sprintId = (await sprintRes.json()).data.id;
        
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'To DONE in Closed', projectId: testProject.id, sprintId }
        });
        const taskId = (await taskRes.json()).data.id;

        // Transition sprint to ACTIVE then set task to DONE (Phase 3 requirement)
        await pmApi.patch(`/api/sprints/${sprintId}/status`, { data: { status: 'ACTIVE' } });
        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'IN_PROGRESS' } });
        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'DONE' } });

        // Move sprint to CLOSED
        await pmApi.patch(`/api/sprints/${sprintId}/status`, { data: { status: 'CLOSED' } });

        // Try to transition a NEW task (not the DONE one) to DONE in this closed sprint
        const task2Res = await pmApi.post('/api/tasks', {
            data: { title: 'Another task', projectId: testProject.id, sprintId }
        });
        const task2Id = (await task2Res.json()).data.id;
        
        const failRes = await pmApi.patch(`/api/tasks/${task2Id}`, { data: { status: 'DONE' } });
        expect(failRes.status()).toBe(400);
        
        // This will actually hit the CLOSED guard first, which is acceptable
        expect((await failRes.json()).message).toContain('closed sprint');
    });

    test('Transitioning a task to DONE when sprint is ACTIVE succeeds', async ({ pmApi, testProject }) => {
        const sprintRes = await pmApi.post('/api/sprints', {
            data: { name: 'Active Sprint Done', projectId: testProject.id }
        });
        const sprintId = (await sprintRes.json()).data.id;
        await pmApi.patch(`/api/sprints/${sprintId}/status`, { data: { status: 'ACTIVE' } });

        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'To DONE in Active', projectId: testProject.id, sprintId }
        });
        const taskId = (await taskRes.json()).data.id;

        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'IN_PROGRESS' } });
        const doneRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'DONE' } });
        expect(doneRes.status()).toBe(200);
    });

    test('Transitioning a task to IN_PROGRESS when sprint is PLANNING succeeds', async ({ pmApi, testProject }) => {
        const sprintRes = await pmApi.post('/api/sprints', {
            data: { name: 'Planning Sprint Progress', projectId: testProject.id }
        });
        const sprintId = (await sprintRes.json()).data.id;

        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'To PROGRESS in Planning', projectId: testProject.id, sprintId }
        });
        const taskId = (await taskRes.json()).data.id;

        const editRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'IN_PROGRESS' } });
        expect(editRes.status()).toBe(200);
    });

    test('Transitioning a task to CANCELLED when sprint is PLANNING succeeds', async ({ pmApi, testProject }) => {
        const sprintRes = await pmApi.post('/api/sprints', {
            data: { name: 'Planning Sprint Cancel', projectId: testProject.id }
        });
        const sprintId = (await sprintRes.json()).data.id;

        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'To CANCELLED in Planning', projectId: testProject.id, sprintId }
        });
        const taskId = (await taskRes.json()).data.id;

        const editRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'CANCELLED' } });
        expect(editRes.status()).toBe(200);
    });

    test('A task with no sprint can still be transitioned to DONE', async ({ pmApi, testProject }) => {
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'No Sprint DONE', projectId: testProject.id }
        });
        const taskId = (await taskRes.json()).data.id;

        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'IN_PROGRESS' } });
        const doneRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'DONE' } });
        expect(doneRes.status()).toBe(200);
    });
});
