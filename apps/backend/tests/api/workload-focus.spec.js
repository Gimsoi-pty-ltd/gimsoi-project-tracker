
import { test, expect } from "../fixtures/authFixtures.js";
import prisma from "../../lib/prisma.js";

const ENDPOINT = "/api/employees/me/workload";

const getToday = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return `${values.year}-${values.month}-${values.day}`;
};

const getDueDate = (daysFromToday) => {
  const [year, month, day] = getToday().split("-").map(Number);

  // Noon in Johannesburg avoids midnight date-boundary issues.
  return new Date(
    Date.UTC(year, month - 1, day + daysFromToday, 10)
  );
};

const createTask = async ({
  projectId,
  reporterId,
  assigneeId,
  title,
  status = "TODO",
  priority = "MEDIUM",
  daysFromToday = null,
  storyPoints = 0,
  isBlocked = false,
  isDeleted = false,
}) => {
  return prisma.task.create({
    data: {
      projectId,
      reporterId,
      assigneeId,
      title,
      status,
      priority,
      storyPoints,
      isBlocked,
      isDeleted,
      ...(daysFromToday !== null && {
        dueDate: getDueDate(daysFromToday),
      }),
    },
  });
};

test.describe("Sprint 3 - Employee Focus Today Card", () => {
  test("shows only tasks due today when today's tasks exist", async ({
    internApi,
    testProject,
  }) => {
    const employeeResponse = await internApi.get(ENDPOINT);
    expect(employeeResponse.status()).toBe(200);

    const employee = (await employeeResponse.json()).data.employee;

    const project = await prisma.project.findUniqueOrThrow({
      where: { id: testProject.id },
      select: { createdByUserId: true },
    });

    await createTask({
      projectId: testProject.id,
      reporterId: project.createdByUserId,
      assigneeId: employee.id,
      title: "Due Today High",
      status: "IN_PROGRESS",
      priority: "HIGH",
      daysFromToday: 0,
      storyPoints: 5,
    });

    await createTask({
      projectId: testProject.id,
      reporterId: project.createdByUserId,
      assigneeId: employee.id,
      title: "Due Today Low",
      priority: "LOW",
      daysFromToday: 0,
      storyPoints: 2,
    });

    await createTask({
      projectId: testProject.id,
      reporterId: project.createdByUserId,
      assigneeId: employee.id,
      title: "Due Tomorrow",
      priority: "HIGH",
      daysFromToday: 1,
    });  

    const response = await internApi.get(ENDPOINT);
    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.data.focusMode).toBe("DUE_TODAY");

    expect(body.data.focusTasks.map((task) => task.title)).toEqual([
      "Due Today High",
      "Due Today Low",
    ]);

    expect(body.data.workload.activeTasks).toBe(3);
    expect(body.data.workload.activeStoryPoints).toBe(7);
  });

  test("shows upcoming and in-progress tasks when nothing is due today", async ({
    internApi,
    testProject,
  }) => {
    const employee = (
      await (await internApi.get(ENDPOINT)).json()
    ).data.employee;

    const project = await prisma.project.findUniqueOrThrow({
      where: { id: testProject.id },
      select: { createdByUserId: true },
    });

    await createTask({
      projectId: testProject.id,
      reporterId: project.createdByUserId,
      assigneeId: employee.id,
      title: "In Progress Without Deadline",
      status: "IN_PROGRESS",
    });

    await createTask({
      projectId: testProject.id,
      reporterId: project.createdByUserId,
      assigneeId: employee.id,
      title: "Upcoming Tomorrow",
      daysFromToday: 1,
    });

    await createTask({
      projectId: testProject.id,
      reporterId: project.createdByUserId,
      assigneeId: employee.id,
      title: "Upcoming Next Week",
      daysFromToday: 7,
    });

    const response = await internApi.get(ENDPOINT);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.data.focusMode).toBe("UP_NEXT");

    expect(body.data.focusTasks.map((task) => task.title)).toEqual([
      "Upcoming Tomorrow",
      "Upcoming Next Week",
      "In Progress Without Deadline",
    ]);
  });

  test("returns EMPTY when no relevant tasks exist", async ({
    internApi,
  }) => {
    const response = await internApi.get(ENDPOINT);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.data.focusMode).toBe("EMPTY");
    expect(body.data.focusTasks).toEqual([]);
  });

  test("excludes deleted tasks from the card", async ({
    internApi,
    testProject,
  }) => {
    const employee = (
      await (await internApi.get(ENDPOINT)).json()
    ).data.employee;

    const project = await prisma.project.findUniqueOrThrow({
      where: { id: testProject.id },
      select: { createdByUserId: true },
    });

    await createTask({
      projectId: testProject.id,
      reporterId: project.createdByUserId,
      assigneeId: employee.id,
      title: "Deleted Task",
      daysFromToday: 0,
      isDeleted: true,
    });

    const response = await internApi.get(ENDPOINT);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.data.focusMode).toBe("EMPTY");
    expect(body.data.focusTasks).toEqual([]);
  });

  test("includes completed tasks due today with their status", async ({
    internApi,
    testProject,
  }) => {
    const employee = (
      await (await internApi.get(ENDPOINT)).json()
    ).data.employee;

    const project = await prisma.project.findUniqueOrThrow({
      where: { id: testProject.id },
      select: { createdByUserId: true },
    });

    await createTask({
      projectId: testProject.id,
      reporterId: project.createdByUserId,
      assigneeId: employee.id,
      title: "Completed Today",
      status: "DONE",
      daysFromToday: 0,
    });

    const response = await internApi.get(ENDPOINT);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.data.focusMode).toBe("DUE_TODAY");

    expect(body.data.focusTasks).toHaveLength(1);
    expect(body.data.focusTasks[0].status).toBe("DONE");
  });
});
