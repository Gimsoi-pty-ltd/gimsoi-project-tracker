import { test, expect } from "../fixtures/authFixtures.js";

test.describe("Activity Log API", () => {
    test("User can log and retrieve custom activity logs", async ({ pmApi }) => {
        // 1. Log a new custom activity
        const createRes = await pmApi.post("/api/activity", {
            data: {
                action: "USER_LOGIN",
                entityId: "test-login-id",
                entityType: "AUTH",
            },
        });
        expect(createRes.status()).toBe(201);
        const { data: activity } = await createRes.json();
        expect(activity.action).toBe("USER_LOGIN");
        expect(activity.entityId).toBe("test-login-id");
        expect(activity.entityType).toBe("AUTH");

        // 2. Retrieve user activity logs
        const getRes = await pmApi.get("/api/activity");
        expect(getRes.status()).toBe(200);
        const { data: activities } = await getRes.json();
        expect(activities.length).toBeGreaterThan(0);
        expect(activities[0].action).toBe("USER_LOGIN");
    });
});
