
import prisma from "../../lib/prisma.js";
import { test, expect } from "../fixtures/authFixtures.js";

test.describe("Employee Recommendations API", () => {
    test("PM who owns the project can retrieve recommendations", async ({
        pmApi,
        testProject,
    }) => {
        const response = await pmApi.get(
            `/api/projects/${testProject.id}/employee-recommendations`
        );

        expect(response.status()).toBe(200);

        const body = await response.json();

        expect(body.success).toBe(true);
        expect(body.data).toBeInstanceOf(Array);
    });

    test("ADMIN can retrieve employee recommendations", async ({
        adminApi,
        testProject,
    }) => {
        const response = await adminApi.get(
            `/api/projects/${testProject.id}/employee-recommendations`
        );

        expect(response.status()).toBe(200);

        const body = await response.json();

        expect(body.success).toBe(true);
        expect(body.data).toBeInstanceOf(Array);
    });

    test("CLIENT cannot retrieve employee recommendations", async ({
        clientApi,
        testProject,
    }) => {
        const response = await clientApi.get(
            `/api/projects/${testProject.id}/employee-recommendations`
        );

        expect(response.status()).toBe(403);
    });

    test("INTERN cannot retrieve employee recommendations", async ({
        internApi,
        testProject,
    }) => {
        const response = await internApi.get(
            `/api/projects/${testProject.id}/employee-recommendations`
        );

        expect(response.status()).toBe(403);
    });

    test("PM cannot retrieve recommendations for another PM's project", async ({
        pmApi,
        testProject,
        request,
    }) => {
        const email = `other-pm-${Date.now()}@gimsoi.test`;
        const password = "Test123!@#";

        // Create another user.
        const signupResponse = await request.post("/api/auth/signup", {
            data: {
                email,
                password,
                fullName: "Another PM",
            },
        });

        expect(signupResponse.status()).toBeLessThan(400);

        // Promote the new user to PM and verify the account.
        await prisma.user.update({
            where: { email },
            data: {
                role: "PM",
                isVerified: true,
            },
        });

        // Log in to obtain a token containing the PM role.
        const loginResponse = await request.post("/api/auth/login", {
            data: { email, password },
        });

        expect(loginResponse.status()).toBe(200);

        const loginBody = await loginResponse.json();

        expect(loginBody.token).toBeDefined();

        // The second PM attempts to access the first PM's project.
        const response = await request.get(
            `/api/projects/${testProject.id}/employee-recommendations`,
            {
                headers: {
                    Authorization: `Bearer ${loginBody.token}`,
                },
            }
        );

        expect(response.status()).toBe(403);
    });
});
