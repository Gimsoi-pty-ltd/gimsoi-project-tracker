import { test, expect } from '../fixtures/authFixtures.js';
import prisma from '../../lib/prisma.js';

test.describe('Notification API Tests', () => {

    test('1. returns 401 Unauthorized when calling without authentication', async ({ request }) => {
        const getRes = await request.get('/api/notifications');
        expect(getRes.status()).toBe(401);

        const patchAllRes = await request.patch('/api/notifications/read-all');
        expect(patchAllRes.status()).toBe(401);

        const patchSingleRes = await request.patch('/api/notifications/some-uuid/read');
        expect(patchSingleRes.status()).toBe(401);
    });

    test('2. returns 200 OK retrieving empty vs populated list for authenticated user', async ({ internApi }) => {
        // Find the user belonging to this internApi session
        const meRes = await internApi.get('/api/users/profile');
        const meData = await meRes.json();
        const userId = meData.user.id;

        // Clear existing notifications for isolation
        await prisma.notification.deleteMany({ where: { userId } });

        // Empty list check
        const emptyRes = await internApi.get('/api/notifications');
        expect(emptyRes.status()).toBe(200);
        const emptyJson = await emptyRes.json();
        expect(emptyJson.success).toBe(true);
        expect(emptyJson.data).toEqual([]);

        // Seed 2 notifications for this user
        await prisma.notification.createMany({
            data: [
                { userId, title: 'Notice 1', message: 'Hello 1', type: 'INFO', isRead: false },
                { userId, title: 'Notice 2', message: 'Hello 2', type: 'ALERT', isRead: false },
            ]
        });

        // Populated list check
        const populatedRes = await internApi.get('/api/notifications');
        expect(populatedRes.status()).toBe(200);
        const populatedJson = await populatedRes.json();
        expect(populatedJson.success).toBe(true);
        expect(populatedJson.data.length).toBe(2);
        expect(populatedJson.data[0].userId).toBe(userId);
    });

    test('3. Isolation test: User A cannot retrieve or mark as read User B notification (returns 404)', async ({ internApi, pmApi }) => {
        const meRes = await internApi.get('/api/users/profile');
        const internUser = (await meRes.json()).user;

        // Create a notification owned by PM user
        const pmMeRes = await pmApi.get('/api/users/profile');
        const pmUser = (await pmMeRes.json()).user;

        const pmNotification = await prisma.notification.create({
            data: {
                userId: pmUser.id,
                title: 'Confidential PM Notice',
                message: 'PM only content',
                type: 'INFO',
                isRead: false
            }
        });

        // 1. Intern should not see PM notification in their list
        const internListRes = await internApi.get('/api/notifications');
        const internList = (await internListRes.json()).data;
        const existsInList = internList.some((n) => n.id === pmNotification.id);
        expect(existsInList).toBe(false);

        // 2. Intern attempts to mark PM's notification as read -> must return 404 Not Found
        const markRes = await internApi.patch(`/api/notifications/${pmNotification.id}/read`);
        expect(markRes.status()).toBe(404);
        const markJson = await markRes.json();
        expect(markJson.success).toBe(false);
        expect(markJson.message).toBe('Notification not found');

        // Verify the notification remains unread in database
        const dbNotif = await prisma.notification.findUnique({
            where: { id: pmNotification.id }
        });
        expect(dbNotif.isRead).toBe(false);
    });

    test('4. Marking a single notification as read updates isRead to true', async ({ internApi }) => {
        const meRes = await internApi.get('/api/users/profile');
        const user = (await meRes.json()).user;

        const notif = await prisma.notification.create({
            data: {
                userId: user.id,
                title: 'Read Test',
                message: 'Test marking as read',
                isRead: false
            }
        });

        const patchRes = await internApi.patch(`/api/notifications/${notif.id}/read`);
        expect(patchRes.status()).toBe(200);
        const patchJson = await patchRes.json();
        expect(patchJson.success).toBe(true);
        expect(patchJson.message).toBe('Marked as read');

        // Verify in DB
        const updated = await prisma.notification.findUnique({ where: { id: notif.id } });
        expect(updated.isRead).toBe(true);
    });

    test('5. PATCH /read-all updates only the current user unread notifications', async ({ internApi, pmApi }) => {
        const internRes = await internApi.get('/api/users/profile');
        const internUser = (await internRes.json()).user;

        const pmRes = await pmApi.get('/api/users/profile');
        const pmUser = (await pmRes.json()).user;

        // Create unread notifications for both users
        const internNotif1 = await prisma.notification.create({
            data: { userId: internUser.id, title: 'Intern N1', message: 'msg', isRead: false }
        });
        const internNotif2 = await prisma.notification.create({
            data: { userId: internUser.id, title: 'Intern N2', message: 'msg', isRead: false }
        });
        const pmNotif = await prisma.notification.create({
            data: { userId: pmUser.id, title: 'PM N1', message: 'msg', isRead: false }
        });

        // Intern marks all as read
        const markAllRes = await internApi.patch('/api/notifications/read-all');
        expect(markAllRes.status()).toBe(200);
        const markAllJson = await markAllRes.json();
        expect(markAllJson.success).toBe(true);
        expect(markAllJson.message).toBe('All notifications marked as read');

        // Check DB: Intern's notifications should now be read
        const checkIntern1 = await prisma.notification.findUnique({ where: { id: internNotif1.id } });
        const checkIntern2 = await prisma.notification.findUnique({ where: { id: internNotif2.id } });
        expect(checkIntern1.isRead).toBe(true);
        expect(checkIntern2.isRead).toBe(true);

        // Check DB: PM's notification must remain unread
        const checkPm = await prisma.notification.findUnique({ where: { id: pmNotif.id } });
        expect(checkPm.isRead).toBe(false);
    });

    test('6. Rate limiting enforces max requests and returns 429 Too Many Requests', async ({ request }) => {
        // Notification rate limiter limit is 60 requests per window
        // Send rapid requests to exceed limit from the same IP/request context
        let hitRateLimit = false;

        for (let i = 0; i < 65; i++) {
            const res = await request.get('/api/notifications');
            if (res.status() === 429) {
                hitRateLimit = true;
                const json = await res.json();
                expect(json.success).toBe(false);
                expect(json.message).toContain('Too many requests');
                break;
            }
        }

        expect(hitRateLimit).toBe(true);
    });
});
