
import { test, expect } from "../fixtures/authFixtures.js";

const endpoint = "/api/employees/me/workload";

test.describe("Sprint 3 - Workload API", () => {
  test("ADMIN can view own workload", async ({ adminApi }) => {
    const response = await adminApi.get(endpoint);

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data.employee.role).toBe("ADMIN");
    expect(body.data.workload).toBeDefined();
    expect(Array.isArray(body.data.focusTasks)).toBe(true);
  });

  test("PM can view own workload", async ({ pmApi }) => {
    const response = await pmApi.get(endpoint);

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data.employee.role).toBe("PM");
  });

  test("INTERN can view own workload", async ({ internApi }) => {
    const response = await internApi.get(endpoint);

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data.employee.role).toBe("INTERN");
  });

  test("CLIENT cannot access workload", async ({ clientApi }) => {
    const response = await clientApi.get(endpoint);

    expect(response.status()).toBe(403);
  });

  test("Unauthenticated requests are rejected", async ({ request }) => {
    const response = await request.get(endpoint, {
      headers: {
        Authorization: "",
        Cookie: "",
      },
    });

    expect(response.status()).toBe(401);
  });

  test("Employee with no tasks receives zero workload", async ({ internApi }) => {
    const response = await internApi.get(endpoint);

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.data.workload).toMatchObject({
      activeTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      blockedTasks: 0,
      activeStoryPoints: 0,
    });

    expect(body.data.focusTasks).toEqual([]);
  });
});
