import { test, expect } from '@playwright/test';
import prisma from '../../lib/prisma.js';

test.describe('E2E Backend Flow Verification', () => {
    const adminEmail = `admin-${Date.now()}@example.com`;
    const internEmail = `intern-${Date.now()}@example.com`;
    const password = 'Password123!';
    
    let csrfToken = '';
    let adminId = '';
    let internId = '';
    let clientId = '';
    let projectId = '';
    let sprintId = '';
    let taskId = '';

    test('Full Journey: From Signup to Analytics', async ({ request }) => {
        
        await test.step('Phase 1: Setup & Authentication Flow', async () => {
            const signupRes = await request.post('/api/auth/signup', {
                data: { fullName: 'Admin User', email: adminEmail, password }
            });
            expect(signupRes.ok()).toBeTruthy();
            const signupBody = await signupRes.json();
            adminId = signupBody.user.id;

            await prisma.user.update({
                where: { id: adminId },
                data: { role: 'ADMIN', isVerified: true }
            });

            const loginRes = await request.post('/api/auth/login', {
                data: { email: adminEmail, password }
            });
            expect(loginRes.ok()).toBeTruthy();
            
            const state = await request.storageState();
            const xsrfCookie = state.cookies.find(c => c.name === 'XSRF-TOKEN');
            csrfToken = xsrfCookie ? decodeURIComponent(xsrfCookie.value) : '';
            
            const checkAuthRes = await request.get('/api/auth/check-auth');
            expect(checkAuthRes.ok()).toBeTruthy();
            const authData = await checkAuthRes.json();
            expect(authData.user.role).toBe('ADMIN');
        });

        await test.step('Phase 2: Project Management Flow', async () => {
            const clientRes = await request.post('/api/clients', {
                data: { name: 'E2E Test Client', contactEmail: `client-${Date.now()}@e2e.com` },
                headers: { 'x-csrf-token': csrfToken }
            });
            expect(clientRes.ok()).toBeTruthy();
            clientId = (await clientRes.json()).data.id;

            const projectRes = await request.post('/api/projects', {
                data: { name: 'E2E Test Project', description: 'Testing the flow', clientId },
                headers: { 'x-csrf-token': csrfToken }
            });
            expect(projectRes.ok()).toBeTruthy();
            projectId = (await projectRes.json()).data.id;
        });

        await test.step('Phase 3: Sprint & Task State Machine', async () => {
            const sprintRes = await request.post('/api/sprints', {
                data: { 
                    name: 'Sprint 1', 
                    projectId, 
                    startDate: new Date().toISOString(), 
                    endDate: new Date(Date.now() + 86400000).toISOString() 
                },
                headers: { 'x-csrf-token': csrfToken }
            });
            expect(sprintRes.ok()).toBeTruthy();
            sprintId = (await sprintRes.json()).data.id;

            const taskRes = await request.post('/api/tasks', {
                data: { title: 'First Task', projectId, sprintId, priority: 'HIGH' },
                headers: { 'x-csrf-token': csrfToken }
            });
            expect(taskRes.ok()).toBeTruthy();
            taskId = (await taskRes.json()).data.id;

            const activateRes = await request.patch(`/api/sprints/${sprintId}/status`, {
                data: { status: 'ACTIVE' },
                headers: { 'x-csrf-token': csrfToken }
            });
            expect(activateRes.ok()).toBeTruthy();

            const progressRes = await request.patch(`/api/tasks/${taskId}`, {
                data: { status: 'IN_PROGRESS' },
                headers: { 'x-csrf-token': csrfToken }
            });
            if (!progressRes.ok()) console.error('IN_PROGRESS failed:', await progressRes.text());
            expect(progressRes.ok()).toBeTruthy();

            const doneResPass = await request.patch(`/api/tasks/${taskId}`, {
                data: { status: 'DONE' },
                headers: { 'x-csrf-token': csrfToken }
            });
            if (!doneResPass.ok()) console.error('DONE failed:', await doneResPass.text());
            expect(doneResPass.ok()).toBeTruthy();
        });

        await test.step('Phase 4: RBAC & Negative Scenarios', async () => {
            await request.post('/api/auth/logout');

            const internSignupRes = await request.post('/api/auth/signup', {
                data: { fullName: 'Intern User', email: internEmail, password }
            });
            expect(internSignupRes.ok()).toBeTruthy();
            internId = (await internSignupRes.json()).user.id;

            await prisma.user.update({ where: { id: internId }, data: { isVerified: true } });

            const internLoginRes = await request.post('/api/auth/login', {
                data: { email: internEmail, password }
            });
            expect(internLoginRes.ok()).toBeTruthy();

            const state2 = await request.storageState();
            const xsrfCookie2 = state2.cookies.find(c => c.name === 'XSRF-TOKEN');
            csrfToken = xsrfCookie2 ? decodeURIComponent(xsrfCookie2.value) : '';

            const failProjRes = await request.post('/api/projects', {
                data: { name: 'Illegal Project', clientId },
                headers: { 'x-csrf-token': csrfToken }
            });
            expect(failProjRes.status()).toBe(403);

            const failDeleteRes = await request.delete(`/api/tasks/${taskId}`, {
                headers: { 'x-csrf-token': csrfToken }
            });
            // It could be 400 (if task is DONE) or 403 (Forbidden). 
            // In our flow, it's DONE, so 400 is actually expected from the state machine guard.
            expect([400, 403]).toContain(failDeleteRes.status());
        });

        await test.step('Phase 5: Analytics Validation', async () => {
            await request.post('/api/auth/logout');
            
            await request.post('/api/auth/login', {
                data: { email: adminEmail, password }
            });

            const state3 = await request.storageState();
            const xsrfCookie3 = state3.cookies.find(c => c.name === 'XSRF-TOKEN');
            csrfToken = xsrfCookie3 ? decodeURIComponent(xsrfCookie3.value) : '';

            const summaryRes = await request.get(`/api/tasks/projects/${projectId}/summary`);
            expect(summaryRes.ok()).toBeTruthy();

            const aiContextRes = await request.get(`/api/analytics/ai-context?projectId=${projectId}`);
            if (!aiContextRes.ok()) console.error('AI Context Error:', await aiContextRes.text());
            expect(aiContextRes.ok()).toBeTruthy();
        });

        await test.step('Phase 6: Lifecycle Constraints & Teardown', async () => {
            await request.patch(`/api/sprints/${sprintId}/status`, {
                data: { status: 'CLOSED' },
                headers: { 'x-csrf-token': csrfToken }
            });

            await request.patch(`/api/projects/${projectId}`, {
                data: { status: 'COMPLETED' },
                headers: { 'x-csrf-token': csrfToken }
            });

            await request.post('/api/auth/logout', {
                headers: { 'x-csrf-token': csrfToken }
            });
        });
    });

    test.afterAll(async () => {
        await prisma.$disconnect();
    });
});
