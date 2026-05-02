import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Phases & Milestones API', () => {
    let projectId;
    let clientId;

    test.beforeAll(async ({ pmApi }) => {
        // Create a client
        const clientRes = await pmApi.post('/api/clients', {
            data: {
                name: 'Wave 4 Client',
                contactEmail: 'wave4@test.com'
            }
        });
        const clientBody = await clientRes.json();
        clientId = clientBody.data.id;

        // Create a project
        const projectRes = await pmApi.post('/api/projects', {
            data: {
                name: 'Wave 4 Project',
                clientId,
                status: 'ACTIVE'
            }
        });
        const projectBody = await projectRes.json();
        projectId = projectBody.data.id;
    });

    test('Phase Lifecycle & Auto-completion', async ({ pmApi }) => {
        // 1. Create a phase
        const phaseRes = await pmApi.post('/api/phases', {
            data: {
                name: 'Phase 1',
                projectId,
                status: 'ACTIVE',
                order: 1
            }
        });
        expect(phaseRes.status()).toBe(201);
        const phase = (await phaseRes.json()).data;

        // 2. Create an active sprint
        const sprintRes = await pmApi.post('/api/sprints', {
            data: {
                name: 'Wave 4 Sprint',
                projectId,
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 86400000).toISOString(),
                status: 'ACTIVE'
            }
        });
        const sprint = (await sprintRes.json()).data;

        // 3. Create a task in this phase
        const taskRes = await pmApi.post('/api/tasks', {
            data: {
                title: 'Task in Phase 1',
                projectId,
                phaseId: phase.id,
                sprintId: sprint.id,
                priority: 'MEDIUM',
                status: 'TODO'
            }
        });
        const task = (await taskRes.json()).data;

        // 4. Check milestone status (0%)
        const milestoneRes = await pmApi.get(`/api/phases/${phase.id}/milestone`);
        expect(milestoneRes.status()).toBe(200);
        const milestone = (await milestoneRes.json()).data;
        expect(milestone.percentComplete).toBe(0);
        expect(milestone.status).toBe('ACTIVE');

        // 5. Complete the task
        await pmApi.patch(`/api/tasks/${task.id}`, {
            data: {
                status: 'IN_PROGRESS',
                version: task.version
            }
        });
        const updateRes = await pmApi.patch(`/api/tasks/${task.id}`, {
            data: {
                status: 'DONE',
                version: task.version + 1
            }
        });
        expect(updateRes.status()).toBe(200);

        // 6. Check if phase is auto-completed
        const finalPhaseRes = await pmApi.get(`/api/phases/${phase.id}`);
        const finalPhase = (await finalPhaseRes.json()).data;
        expect(finalPhase.status).toBe('COMPLETED');

        // 7. Check milestone status (100%)
        const finalMilestoneRes = await pmApi.get(`/api/phases/${phase.id}/milestone`);
        const finalMilestone = (await finalMilestoneRes.json()).data;
        expect(finalMilestone.percentComplete).toBe(100);
    });

    test('Phase Reordering', async ({ pmApi }) => {
        // Create two phases
        const p1Res = await pmApi.post('/api/phases', { 
            data: { name: 'A', projectId, order: 10 } 
        });
        const p2Res = await pmApi.post('/api/phases', { 
            data: { name: 'B', projectId, order: 20 } 
        });
        const p1 = (await p1Res.json()).data;
        const p2 = (await p2Res.json()).data;

        // Update order
        await pmApi.patch(`/api/phases/${p1.id}`, { 
            data: { order: 30, version: p1.version } 
        });

        // List phases - B should now be first (order 20 < 30)
        const listRes = await pmApi.get(`/api/phases?projectId=${projectId}`);
        const phases = (await listRes.json()).data;
        
        // The list should be sorted by order: Phase 1 (1), B (20), A (30)
        const names = phases.map(p => p.name);
        expect(names).toContain('Phase 1');
        expect(names).toContain('A');
        expect(names).toContain('B');
        
        // Find positions
        const idxP1 = names.indexOf('Phase 1');
        const idxB = names.indexOf('B');
        const idxA = names.indexOf('A');
        
        expect(idxP1).toBeLessThan(idxB);
        expect(idxB).toBeLessThan(idxA);
        // Actually since globalSetup wipes, we can assume Phase 1 is there if we didn't wipe.
        // Wait, globalSetup runs BEFORE all tests in a file if configured? 
        // No, playwright runs it once per WORKER.
    });
});
