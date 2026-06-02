import { test, expect } from '../fixtures/authFixtures.js';

test.describe('Project Member API', () => {
    test('PM can add and remove a member', async ({ pmApi, adminApi, testProject }) => {
        // 1. Get another user (Intern)
        const authRes = await adminApi.get('/api/users');
        const users = (await authRes.json()).data;
        const intern = users.find(u => u.role === 'INTERN');

        // 2. Add member
        const addRes = await pmApi.post(`/api/projects/${testProject.id}/members`, {
            data: { userId: intern.id, role: 'MEMBER' }
        });
        expect(addRes.status()).toBe(201);
        
        // 3. List members
        const listRes = await pmApi.get(`/api/projects/${testProject.id}/members`);
        expect(listRes.status()).toBe(200);
        const members = (await listRes.json()).data;
        expect(members.some(m => m.userId === intern.id)).toBe(true);

        // 4. Update member role
        const updateRes = await pmApi.patch(`/api/projects/${testProject.id}/members/${intern.id}`, {
            data: { role: 'VIEWER' }
        });
        expect(updateRes.status()).toBe(200);

        // 5. Remove member
        const delRes = await pmApi.delete(`/api/projects/${testProject.id}/members/${intern.id}`);
        expect(delRes.status()).toBe(204);

        // 6. Verify removed
        const finalRes = await pmApi.get(`/api/projects/${testProject.id}/members`);
        const finalMembers = (await finalRes.json()).data;
        expect(finalMembers.some(m => m.userId === intern.id)).toBe(false);
    });

    test('INTERN cannot add members', async ({ internApi, testProject, adminApi }) => {
        const usersRes = await adminApi.get('/api/users');
        const other = (await usersRes.json()).data[0];

        const res = await internApi.post(`/api/projects/${testProject.id}/members`, {
            data: { userId: other.id, role: 'MEMBER' }
        });
        expect(res.status()).toBe(403);
    });
});
