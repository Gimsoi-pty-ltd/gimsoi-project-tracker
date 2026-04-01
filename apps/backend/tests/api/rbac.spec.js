import { test, expect } from '../fixtures/authFixtures.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('RBAC & Permission Hardening', () => {

    test.describe('Service Structural Integrity', () => {
        test('canModifyTask contains no hardcoded role string literals', async () => {
            const filePath = path.resolve(__dirname, '../../services/task.service.js');
            const content = fs.readFileSync(filePath, 'utf8');

            // Find the canModifyTask function body
            const match = content.match(/const canModifyTask = \([\s\S]*?};/);
            if (!match) throw new Error("canModifyTask not found");

            const body = match[0];

            // We want to avoid 'ADMIN', 'PM', 'INTERN', 'CLIENT' as string literals in logic.
            const literals = ["'ADMIN'", '"ADMIN"', "'PM'", '"PM"', "'INTERN'", '"INTERN"', "'CLIENT'", '"CLIENT"'];

            literals.forEach(lit => {
                expect(body).not.toContain(lit);
            });
        });
    });

    test.describe('Task Permissions', () => {

        test('ADMIN can modify any task globally via permission matrix', async ({ adminApi, testProject }) => {
            const taskRes = await adminApi.post('/api/tasks', {
                data: { title: 'RBAC Admin Task', projectId: testProject.id }
            });
            expect(taskRes.status()).toBe(201);
            const { data: task } = await taskRes.json();

            const updateRes = await adminApi.patch(`/api/tasks/${task.id}`, {
                data: { title: 'Updated By Admin' }
            });
            expect(updateRes.status()).toBe(200);
        });

        test('PM can modify any task globally via permission matrix', async ({ pmApi, testProject }) => {
            const taskRes = await pmApi.post('/api/tasks', {
                data: { title: 'RBAC PM Task', projectId: testProject.id }
            });
            expect(taskRes.status()).toBe(201);
            const { data: task } = await taskRes.json();

            const updateRes = await pmApi.patch(`/api/tasks/${task.id}`, {
                data: { description: 'Updated by PM' }
            });
            expect(updateRes.status()).toBe(200);
        });

        test('INTERN is forbidden from creating tasks', async ({ internApi, testProject }) => {
            const res = await internApi.post('/api/tasks', {
                data: { title: 'Illegal Intern Task', projectId: testProject.id }
            });
            expect(res.status()).toBe(403);
            const body = await res.json();
            expect(body.message).toMatch(/not have 'CREATE_TASK' permission|is not authorized to create tasks/);
        });

        test('INTERN (Reporter) can update their own reported task', async ({ internApi, testProject }) => {
            // Intern creates task (promoted by testing route potentially, or using fixture if available)
            // But usually Intern can't create task. 
            // So we need to test the "Reporter" branch of canModifyTask.
            // We can manually set the reporterId in the DB or via a privileged route.
        });

        test('INTERN (Assignee) can update status but NOT title', async ({ pmApi, internApi, testProject }) => {
            const authRes = await internApi.get('/api/auth/check-auth');
            const internUser = (await authRes.json()).user;

            // 1. PM creates task and assigns to Intern
            const createRes = await pmApi.post('/api/tasks', {
                data: { title: 'Editable Task', projectId: testProject.id, assigneeId: internUser.id }
            });
            const task = (await createRes.json()).data;

            // 2. Intern attempts to update title -> 403
            const res1 = await internApi.patch(`/api/tasks/${task.id}`, {
                data: { title: 'Intern Changed Title' }
            });
            expect(res1.status()).toBe(403);

            // 3. Intern attempts to update status -> 200 (Permitted via UPDATE_OWN_TASK_STATUS)
            const res2 = await internApi.patch(`/api/tasks/${task.id}`, {
                data: { status: 'IN_PROGRESS' }
            });
            expect(res2.status()).toBe(200);
            const body2 = await res2.json();
            expect(body2.data.status).toBe('IN_PROGRESS');
        });

        test('Non-reporter/Non-assignee Intern is blocked from updating task (403)', async ({ pmApi, internApi, testProject }) => {
            // PM creates the task (reporter) and doesn't assign it (assigneeId null)
            const taskRes = await pmApi.post('/api/tasks', {
                data: { title: 'Secret PM Task', projectId: testProject.id }
            });
            const taskId = (await taskRes.json()).data.id;

            // Intern (different user) attempts to update
            const res = await internApi.patch(`/api/tasks/${taskId}`, {
                data: { status: "IN_PROGRESS" }
            });
            expect(res.status()).toBe(403);
        });

        test('INTERN role is blocked from deleting tasks', async ({ adminApi, internApi, testProject }) => {
            const taskRes = await adminApi.post('/api/tasks', {
                data: { title: 'Admin Protected Task', projectId: testProject.id }
            });
            const { data: task } = await taskRes.json();

            const delRes = await internApi.delete(`/api/tasks/${task.id}`);
            expect(delRes.status()).toBe(403);
        });
    });

    test.describe('Project Permissions', () => {
        test('CLIENT role receives restricted task completion view', async ({ clientApi, testProject }) => {
            const res = await clientApi.get(`/api/projects/${testProject.id}/progress`);
            expect(res.status()).toBe(200);
            const data = (await res.json()).data;

            // CLIENT only gets percentComplete, no specific status counts
            expect(data).toHaveProperty('percentComplete');
            expect(data).not.toHaveProperty('DONE');
            expect(data).not.toHaveProperty('TODO');
        });

        test('ADMIN role receives full task breakdown for project', async ({ adminApi, testProject }) => {
            const res = await adminApi.get(`/api/projects/${testProject.id}/progress`);
            expect(res.status()).toBe(200);
            const data = (await res.json()).data;

            expect(data).toHaveProperty('percentComplete');
            expect(data).toHaveProperty('DONE');
            expect(data).toHaveProperty('TODO');
        });

        test('Intern gets 403 when modifying a PM project (Ownership check)', async ({ internApi, testProject }) => {
            const response = await internApi.patch(`/api/projects/${testProject.id}`, {
                data: { name: "Hacked Name" }
            });

            expect(response.status()).toBe(403);
        });
    });
});
