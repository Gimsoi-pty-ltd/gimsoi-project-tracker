import { test, expect } from '../fixtures/authFixtures.js';
import jwt from 'jsonwebtoken';

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

    test('Task creation returns default tracking fields (Phase 1 Baseline)', async ({ pmApi, testProject, testSprint }) => {
        const response = await pmApi.post('/api/tasks', {
            data: {
                title: "Baseline Tracking Task",
                projectId: testProject.id,
                sprintId: testSprint.id
            }
        });

        expect(response.status()).toBe(201);
        const json = await response.json();
        
        // Assert new tracking fields exist with default values
        expect(json.data).toHaveProperty('dueDate', null);
        expect(json.data).toHaveProperty('isBlocked', false);
        expect(json.data).toHaveProperty('blockedReason', null);
    });

    test('PM Completes Task', async ({ pmApi, testProject, testSprint }) => {
        // Create the task — defaults to TODO
        const taskRes = await pmApi.post('/api/tasks', {
            data: {
                title: "Task to complete",
                projectId: testProject.id,
                sprintId: testSprint.id
            }
        });
        expect(taskRes.status()).toBe(201);
        const taskId = (await taskRes.json()).data.id;

        // Legal transition 1: TODO → IN_PROGRESS
        const startRes = await pmApi.patch(`/api/tasks/${taskId}`, {
            data: { status: "IN_PROGRESS" }
        });
        expect(startRes.status()).toBe(200);
        expect((await startRes.json()).data.status).toBe('IN_PROGRESS');

        // Legal transition 2: IN_PROGRESS → DONE
        const finishRes = await pmApi.patch(`/api/tasks/${taskId}`, {
            data: { status: "DONE" }
        });
        expect(finishRes.status()).toBe(200);
        expect((await finishRes.json()).data.status).toBe('DONE');
    });

    test('Non-reporter Intern is blocked from updating a task via 403 Forbidden', async ({ pmApi, internApi, testProject, testSprint }) => {
        // PM creates the task
        const taskRes = await pmApi.post('/api/tasks', {
            data: {
                title: "Top Secret PM Task",
                projectId: testProject.id,
                sprintId: testSprint.id
            }
        });
        const taskData = await taskRes.json();
        const taskId = taskData.data.id;

        // Intern attempts to update the task they didn't report
        const finishRes = await internApi.patch(`/api/tasks/${taskId}`, {
            data: { status: "DONE" }
        });

        // Must explicitly assert 403 Forbidden
        expect(finishRes.status()).toBe(403);
    });

    test('Updating task with invalid status returns 400 StateTransitionError', async ({ pmApi, testProject, testSprint }) => {
        // PM creates a task they own (as reporter)
        const taskRes = await pmApi.post('/api/tasks', {
            data: {
                title: "Status Validation Task",
                projectId: testProject.id,
                sprintId: testSprint.id
            }
        });
        expect(taskRes.status()).toBe(201);
        const taskId = (await taskRes.json()).data.id;

        // Attempt to set an invalid status value
        const updateRes = await pmApi.patch(`/api/tasks/${taskId}`, {
            data: { status: "INVALID_STATUS" }
        });

        expect(updateRes.status()).toBe(400);
        const json = await updateRes.json();
        expect(json.message).toContain('Invalid task status');
        expect(json.message).toContain('INVALID_STATUS');
    });

    /**
     * STEP 0 — Acceptance test written BEFORE any service changes.
     * Purpose: defines the desired end-to-end behaviour and acts as a
     * regression guard for all subsequent steps.
     *
     * If this test FAILS at baseline it means the service somehow already
     * blocks a valid transition — investigate before proceeding.
     * If this test PASSES at baseline that is expected (TODO→IN_PROGRESS→DONE
     * is the only path that should work). The service changes in Steps 1-5 must
     * NOT break this happy path.
     */
    test('Full lifecycle: TODO → IN_PROGRESS → DONE happy path', async ({ pmApi, testProject, testSprint }) => {
        // A: create task — must default to TODO
        const taskRes = await pmApi.post('/api/tasks', {
            data: {
                title: 'Lifecycle Acceptance Task',
                projectId: testProject.id,
                sprintId: testSprint.id,
            }
        });
        expect(taskRes.status()).toBe(201);
        const task = (await taskRes.json()).data;
        expect(task.status).toBe('TODO');

        // B: advance to IN_PROGRESS
        const toInProgress = await pmApi.patch(`/api/tasks/${task.id}`, {
            data: { status: 'IN_PROGRESS' }
        });
        expect(toInProgress.status()).toBe(200);
        const inProgressData = (await toInProgress.json()).data;
        expect(inProgressData.status).toBe('IN_PROGRESS');

        // C: advance to DONE
        const toDone = await pmApi.patch(`/api/tasks/${task.id}`, {
            data: { status: 'DONE' }
        });
        expect(toDone.status()).toBe(200);
        const doneData = (await toDone.json()).data;
        expect(doneData.status).toBe('DONE');
    });

    // --- Step 1 tests ---

    test('TODO → IN_PROGRESS is a valid transition', async ({ pmApi, testProject, testSprint }) => {
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Transition Test Task', projectId: testProject.id, sprintId: testSprint.id }
        });
        expect(taskRes.status()).toBe(201);
        const taskId = (await taskRes.json()).data.id;

        const updateRes = await pmApi.patch(`/api/tasks/${taskId}`, {
            data: { status: 'IN_PROGRESS' }
        });
        expect(updateRes.status()).toBe(200);
        expect((await updateRes.json()).data.status).toBe('IN_PROGRESS');
    });

    test('Setting the same status is a no-op (200, status unchanged)', async ({ pmApi, testProject, testSprint }) => {
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'No-op Status Task', projectId: testProject.id, sprintId: testSprint.id }
        });
        expect(taskRes.status()).toBe(201);
        const taskId = (await taskRes.json()).data.id;

        // Send TODO again on a TODO task — must be a silent no-op
        const noOpRes = await pmApi.patch(`/api/tasks/${taskId}`, {
            data: { status: 'TODO' }
        });
        expect(noOpRes.status()).toBe(200);
        expect((await noOpRes.json()).data.status).toBe('TODO');
    });

    // --- Step 2 tests ---

    test('DONE → TODO is blocked (400)', async ({ pmApi, testProject, testSprint }) => {
        // Create -> IN_PROGRESS -> DONE
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Test DONE to TODO', projectId: testProject.id, sprintId: testSprint.id }
        });
        const taskId = (await taskRes.json()).data.id;
        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'IN_PROGRESS' } });
        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'DONE' } });

        // Attempt illegal regression
        const regressRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'TODO' } });
        expect(regressRes.status()).toBe(400);
        expect((await regressRes.json()).message).toContain('Cannot modify');
    });

    test('DONE → IN_PROGRESS is blocked (400)', async ({ pmApi, testProject, testSprint }) => {
        // Create -> IN_PROGRESS -> DONE
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Test DONE to IN_PROGRESS', projectId: testProject.id, sprintId: testSprint.id }
        });
        const taskId = (await taskRes.json()).data.id;
        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'IN_PROGRESS' } });
        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'DONE' } });

        // Attempt illegal regression
        const regressRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'IN_PROGRESS' } });
        expect(regressRes.status()).toBe(400);
        expect((await regressRes.json()).message).toContain('Cannot modify');
    });

    test('IN_PROGRESS → TODO is blocked (400)', async ({ pmApi, testProject, testSprint }) => {
        // Create -> IN_PROGRESS
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Test IN_PROGRESS to TODO', projectId: testProject.id, sprintId: testSprint.id }
        });
        const taskId = (await taskRes.json()).data.id;
        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'IN_PROGRESS' } });

        // Attempt illegal regression
        const regressRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'TODO' } });
        expect(regressRes.status()).toBe(400);
        expect((await regressRes.json()).message).toContain('Illegal task transition');
    });

    // --- Step 3 tests ---

    test('Title change on DONE task is blocked (400)', async ({ pmApi, testProject, testSprint }) => {
        // Create -> IN_PROGRESS -> DONE
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Test Title Lock', projectId: testProject.id, sprintId: testSprint.id }
        });
        const taskId = (await taskRes.json()).data.id;
        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'IN_PROGRESS' } });
        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'DONE' } });

        // Attempt illegal field mutation
        const editRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { title: 'Hacked Title' } });
        expect(editRes.status()).toBe(400);
        expect((await editRes.json()).message).toContain('Cannot modify');
    });

    test('Assignee change on DONE task is blocked (400)', async ({ pmApi, testProject, testSprint }) => {
        // Create -> IN_PROGRESS -> DONE
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Test Assignee Lock', projectId: testProject.id, sprintId: testSprint.id }
        });
        const taskId = (await taskRes.json()).data.id;
        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'IN_PROGRESS' } });
        await pmApi.patch(`/api/tasks/${taskId}`, { data: { status: 'DONE' } });

        // Attempt illegal field mutation (using dummy UUID for assignee)
        const editRes = await pmApi.patch(`/api/tasks/${taskId}`, { 
            data: { assigneeId: '00000000-0000-0000-0000-000000000000' } 
        });
        expect(editRes.status()).toBe(400);
        expect((await editRes.json()).message).toContain('Cannot modify');
    });

    // --- Step 4 & 4a tests ---

    test('Task creation inside a COMPLETED project is blocked (400)', async ({ pmApi, testClient }) => {
        // Create and complete a project
        const projRes = await pmApi.post('/api/projects', {
            data: { name: 'Completed Project for Task', clientId: testClient.id }
        });
        const projectId = (await projRes.json()).data.id;
        await pmApi.patch(`/api/projects/${projectId}`, { data: { status: 'COMPLETED' } });

        // Attempt to create a task in it
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Illegal Task', projectId }
        });
        expect(taskRes.status()).toBe(400);
        expect((await taskRes.json()).message).toContain('COMPLETED');
    });

    test('Task creation inside an ACTIVE project succeeds (201)', async ({ pmApi, testClient }) => {
        // Create and activate a project
        const projRes = await pmApi.post('/api/projects', {
            data: { name: 'Active Project for Task', clientId: testClient.id }
        });
        const projectId = (await projRes.json()).data.id;
        await pmApi.patch(`/api/projects/${projectId}`, { data: { status: 'ACTIVE' } });

        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Legal Task', projectId }
        });
        expect(taskRes.status()).toBe(201);
    });

    test('Task update inside a COMPLETED project is blocked (400)', async ({ pmApi, testClient }) => {
        // Create project, activate, create sprint & task
        const projRes = await pmApi.post('/api/projects', {
            data: { name: 'Update Lock Project', clientId: testClient.id }
        });
        const projectId = (await projRes.json()).data.id;
        await pmApi.patch(`/api/projects/${projectId}`, { data: { status: 'ACTIVE' } });

        const sprintRes = await pmApi.post('/api/sprints', {
            data: { name: 'Update Lock Sprint', projectId }
        });
        const sprintId = (await sprintRes.json()).data.id;

        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Pre-completion Task', projectId, sprintId }
        });
        const taskId = (await taskRes.json()).data.id;

        // Now complete the project
        await pmApi.patch(`/api/projects/${projectId}`, { data: { status: 'COMPLETED' } });

        // Attempt to update the task
        const editRes = await pmApi.patch(`/api/tasks/${taskId}`, { data: { title: 'Hacked Title' } });
        expect(editRes.status()).toBe(400);
        expect((await editRes.json()).message).toContain('COMPLETED');
    });

    // --- Step 5 tests ---

    test('An unauthorized user cannot transition a task (403)', async ({ pmApi, internApi, testProject, testSprint }) => {
        // PM creates the task (so PM is the reporter)
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Auth Transition Task', projectId: testProject.id, sprintId: testSprint.id }
        });
        const taskId = (await taskRes.json()).data.id;

        // Intern (different user, not the reporter) attempts to transition it to IN_PROGRESS
        const editRes = await internApi.patch(`/api/tasks/${taskId}`, { data: { status: 'IN_PROGRESS' } });
        expect(editRes.status()).toBe(403);
    });

    // --- Phase 2: Security & Authorization ---

    test('Unauthorized user (non-owner PM) cannot create a task in a project they do not own (Phase 2)', async ({ pmApi, adminApi, testClient }) => {
        // Admin creates a project
        const projRes = await adminApi.post('/api/projects', {
            data: { name: 'Admin Private Project', clientId: testClient.id }
        });
        const projectId = (await projRes.json()).data.id;

        // PM (not the owner) attempts to create a task in Admin's project
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Intruder Task', projectId }
        });

        expect(taskRes.status()).toBe(403);
        const json = await taskRes.json();
        expect(json.message).toContain('Unauthorized access to project boundaries');
    });

    test('Unauthorized user (non-owner PM) cannot update a task in a project they do not own (Phase 2)', async ({ pmApi, adminApi, testClient }) => {
        // Admin creates a project and a task
        const projRes = await adminApi.post('/api/projects', {
            data: { name: 'Admin Project for Update Lock', clientId: testClient.id }
        });
        const projectId = (await projRes.json()).data.id;
        
        const taskRes = await adminApi.post('/api/tasks', {
            data: { title: 'Original Task', projectId }
        });
        const taskId = (await taskRes.json()).data.id;

        // PM (not the owner, not the reporter) attempts to update the task in Admin's project
        const editRes = await pmApi.patch(`/api/tasks/${taskId}`, {
            data: { title: 'Hacked Title' }
        });

        expect(editRes.status()).toBe(403);
        const json = await editRes.json();
        expect(json.message).toContain('Unauthorized access to project boundaries');
    });

    // --- Phase 3: Overdue Tasks ---

    test('Task creation and update with dueDate (Phase 3)', async ({ pmApi, testProject }) => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getUTCDate() + 7);
        futureDate.setUTCMilliseconds(0);
        const isoDate = futureDate.toISOString();

        // Create with dueDate
        const createRes = await pmApi.post('/api/tasks', {
            data: { title: 'Future Task', projectId: testProject.id, dueDate: isoDate }
        });
        expect(createRes.status()).toBe(201);
        const task = (await createRes.json()).data;
        expect(new Date(task.dueDate).toISOString()).toBe(isoDate);

        // Update dueDate
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getUTCDate() + 14);
        nextWeek.setUTCMilliseconds(0);
        const nextIso = nextWeek.toISOString();

        const updateRes = await pmApi.patch(`/api/tasks/${task.id}`, {
            data: { dueDate: nextIso }
        });
        expect(updateRes.status()).toBe(200);
        expect(new Date((await updateRes.json()).data.dueDate).toISOString()).toBe(nextIso);
    });

    test('Filter overdue tasks strictly returns incomplete past tasks (Phase 3)', async ({ pmApi, testProject }) => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getUTCDate() - 1);
        const pastIso = pastDate.toISOString();

        const futureDate = new Date();
        futureDate.setDate(futureDate.getUTCDate() + 1);
        const futureIso = futureDate.toISOString();

        // 1. Task in the past (Overdue)
        await pmApi.post('/api/tasks', {
            data: { title: 'Overdue Task', projectId: testProject.id, dueDate: pastIso }
        });

        // 2. Task in the future (Not Overdue)
        await pmApi.post('/api/tasks', {
            data: { title: 'Future Task', projectId: testProject.id, dueDate: futureIso }
        });

        // 3. Task in the past but DONE (Not Overdue)
        const doneRes = await pmApi.post('/api/tasks', {
            data: { title: 'Done Past Task', projectId: testProject.id, dueDate: pastIso }
        });
        const doneTaskId = (await doneRes.json()).data.id;
        await pmApi.patch(`/api/tasks/${doneTaskId}`, { data: { status: 'IN_PROGRESS' } });
        await pmApi.patch(`/api/tasks/${doneTaskId}`, { data: { status: 'DONE' } });

        // Query overdue
        const queryRes = await pmApi.get(`/api/tasks?projectId=${testProject.id}&filter=overdue`);
        expect(queryRes.status()).toBe(200);
        const data = (await queryRes.json()).data;

        expect(data.length).toBe(1);
        expect(data[0].title).toBe('Overdue Task');
    });

    // --- Phase 4: Blocked Tasks ---

    test('Task can be toggled into and out of blocked state (Phase 4)', async ({ pmApi, testProject }) => {
        // Create blocked task
        const createRes = await pmApi.post('/api/tasks', {
            data: { 
                title: 'Blocked Task', 
                projectId: testProject.id, 
                isBlocked: true, 
                blockedReason: 'Awaiting designs' 
            }
        });
        expect(createRes.status()).toBe(201);
        let task = (await createRes.json()).data;
        expect(task.isBlocked).toBe(true);
        expect(task.blockedReason).toBe('Awaiting designs');

        // Unblock task
        const unblockRes = await pmApi.patch(`/api/tasks/${task.id}`, {
            data: { isBlocked: false, blockedReason: null }
        });
        expect(unblockRes.status()).toBe(200);
        task = (await unblockRes.json()).data;
        expect(task.isBlocked).toBe(false);
        expect(task.blockedReason).toBe(null);
    });

    test('Filter by isBlocked returns only blocked tasks (Phase 4)', async ({ pmApi, testProject }) => {
        // 1. Blocked task
        await pmApi.post('/api/tasks', {
            data: { title: 'Actually Blocked', projectId: testProject.id, isBlocked: true }
        });

        // 2. Normal task
        await pmApi.post('/api/tasks', {
            data: { title: 'Normal Task', projectId: testProject.id, isBlocked: false }
        });

        // Query blocked
        const queryRes = await pmApi.get(`/api/tasks?projectId=${testProject.id}&isBlocked=true`);
        expect(queryRes.status()).toBe(200);
        const data = (await queryRes.json()).data;

        expect(data.length).toBe(1);
        expect(data[0].title).toBe('Actually Blocked');
    });

    // --- Phase 5: Aggregation Endpoint ---

    test('Project task summary returns consolidated metrics (Phase 5)', async ({ pmApi, testProject }) => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getUTCDate() - 5);
        const pastIso = pastDate.toISOString();

        // 1. Overdue & TODO
        await pmApi.post('/api/tasks', {
            data: { title: 'T1', projectId: testProject.id, dueDate: pastIso }
        });

        // 2. Blocked & IN_PROGRESS
        const t2Res = await pmApi.post('/api/tasks', {
            data: { title: 'T2', projectId: testProject.id, isBlocked: true }
        });
        const t2Id = (await t2Res.json()).data.id;
        await pmApi.patch(`/api/tasks/${t2Id}`, { data: { status: 'IN_PROGRESS' } });

        // 3. DONE (not overdue even if date is past)
        const doneRes = await pmApi.post('/api/tasks', {
            data: { title: 'T3', projectId: testProject.id, dueDate: pastIso }
        });
        const doneId = (await doneRes.json()).data.id;
        await pmApi.patch(`/api/tasks/${doneId}`, { data: { status: 'IN_PROGRESS' } });
        await pmApi.patch(`/api/tasks/${doneId}`, { data: { status: 'DONE' } });

        // Query summary
        const res = await pmApi.get(`/api/tasks/projects/${testProject.id}/summary`);
        expect(res.status()).toBe(200);
        const json = await res.json();
        const summary = json.data;

        expect(summary.total).toBe(3);
        expect(summary.overdueCount).toBe(1); // Only T1 (T3 is DONE)
        expect(summary.blockedCount).toBe(1); // Only T2
        expect(summary.statusBreakdown.TODO).toBe(1);
        expect(summary.statusBreakdown.IN_PROGRESS).toBe(1);
        expect(summary.statusBreakdown.DONE).toBe(1);
    });

    // --- Sprint 3 Step 3 tests ---

    test('Partial update: send a PATCH request with only the priority field', async ({ pmApi, testProject, testSprint }) => {
        // Create initial task
        const taskRes = await pmApi.post('/api/tasks', {
            data: { title: 'Baseline Title', projectId: testProject.id, sprintId: testSprint.id }
        });
        const taskId = (await taskRes.json()).data.id;

        // Partial update: only priority
        const patchRes = await pmApi.patch(`/api/tasks/${taskId}`, {
            data: { priority: 'HIGH' }
        });
        expect(patchRes.status()).toBe(200);

        // Assert response shape contains changes while preserving others
        const body = await patchRes.json();
        expect(body.data.priority).toBe('HIGH');
        expect(body.data.title).toBe('Baseline Title');
        expect(body.data.status).toBe('TODO');
    });

    // --- Sprint 3 Step 2 tests ---

    test.describe('GET /api/tasks/:id', () => {
        test('Happy path: an Admin or PM retrieves a valid task by id', async ({ pmApi, testProject, testSprint }) => {
            const taskRes = await pmApi.post('/api/tasks', {
                data: { title: 'GET Task Demo', projectId: testProject.id, sprintId: testSprint.id }
            });
            const taskId = (await taskRes.json()).data.id;

            const res = await pmApi.get(`/api/tasks/${taskId}`);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.data.id).toBe(taskId);
            expect(body.data.title).toBe('GET Task Demo');
        });

        test('Not found: request a randomly generated UUID', async ({ pmApi }) => {
            const randomId = '123e4567-e89b-12d3-a456-426614174000';
            const res = await pmApi.get(`/api/tasks/${randomId}`);
            expect(res.status()).toBe(404);
        });

        test('Unauthorized: request without a token', async ({ request, pmApi, testProject, testSprint }) => {
            const taskRes = await pmApi.post('/api/tasks', {
                data: { title: 'Unauthorized Test', projectId: testProject.id, sprintId: testSprint.id }
            });
            const taskId = (await taskRes.json()).data.id;

            const res = await request.get(`/api/tasks/${taskId}`);
            expect(res.status()).toBe(401);
        });

        test('Forbidden: request with a role that does not have VIEW_PROGRESS permission', async ({ request, pmApi, testProject, testSprint }) => {
            const taskRes = await pmApi.post('/api/tasks', {
                data: { title: 'Forbidden Test Task', projectId: testProject.id, sprintId: testSprint.id }
            });
            const taskId = (await taskRes.json()).data.id;
            
            // Forge a validly signed token with an invalid role to trigger 403 Forbidden
            const secret = process.env.JWT_SECRET || 'gs#secret';
            const forbiddenToken = jwt.sign({ id: 'fake-id', role: 'INVALID_ROLE' }, secret, { expiresIn: '1h' });

            const res = await request.get(`/api/tasks/${taskId}`, {
                headers: { 'Authorization': `Bearer ${forbiddenToken}` }
            });
            expect(res.status()).toBe(403);
        });
    });

});
