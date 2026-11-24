
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

  // Verifying correct priority ordering.
  test("sorts focus tasks by priority from URGENT to LOW", async ({
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

    // Create tasks in deliberately incorrect priority order.
    await createTask({
      projectId: testProject.id,
      reporterId: project.createdByUserId,
      assigneeId: employee.id,
      title: "Low Priority Task",
      priority: "LOW",
      daysFromToday: 0,
    });

    await createTask({
      projectId: testProject.id,
      reporterId: project.createdByUserId,
      assigneeId: employee.id,
      title: "Urgent Priority Task",
      priority: "URGENT",
      daysFromToday: 0,
    });

    await createTask({
      projectId: testProject.id,
      reporterId: project.createdByUserId,
      assigneeId: employee.id,
      title: "Medium Priority Task",
      priority: "MEDIUM",
      daysFromToday: 0,
    });

    await createTask({
      projectId: testProject.id,
      reporterId: project.createdByUserId,
      assigneeId: employee.id,
      title: "High Priority Task",
      priority: "HIGH",
      daysFromToday: 0,
    });

    const response = await internApi.get(ENDPOINT);
    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.data.focusMode).toBe("DUE_TODAY");
    expect(body.data.focusTasks.map((task) => task.title)).toEqual([
      "Urgent Priority Task",
      "High Priority Task",
      "Medium Priority Task",
      "Low Priority Task",
    ]);
  });

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


test.describe("Sprint 4 - Workload Calculations", () => {
  test("calculates active, completed, overdue, blocked tasks and story points correctly", async ({
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

    const taskDetails = {
      projectId: testProject.id,
      reporterId: project.createdByUserId,
      assigneeId: employee.id,
    };

    // Task A: Active and overdue.
    await createTask({
      ...taskDetails,
      title: "Overdue Active Task",
      status: "TODO",
      storyPoints: 5,
      daysFromToday: -1,
    });

    // Task B: Completed, even though its due date has passed.
    await createTask({
      ...taskDetails,
      title: "Completed Overdue Task",
      status: "DONE",
      storyPoints: 8,
      daysFromToday: -1,
    });

    // Task C: Cancelled tasks should not count towards workload.
    await createTask({
      ...taskDetails,
      title: "Cancelled Task",
      status: "CANCELLED",
      storyPoints: 13,
      daysFromToday: -1,
    });

    // Task D: Blocked by its status, but not overdue.
    await createTask({
      ...taskDetails,
      title: "Blocked Task",
      status: "BLOCKED",
      storyPoints: 3,
      daysFromToday: 2,
    });

    // Task E: Active task manually marked as blocked.
    await createTask({
      ...taskDetails,
      title: "Manually Blocked Task",
      status: "TODO",
      storyPoints: 2,
      isBlocked: true,
    });

    const response = await internApi.get(ENDPOINT);

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.data.workload).toMatchObject({
      activeTasks: 3,
      completedTasks: 1,
      overdueTasks: 1,
      blockedTasks: 2,
      activeStoryPoints: 10,
    });
  });

  // Sprint 4: Focus Today card should return no more than five tasks.
  test("limits the Focus Today card to five tasks", async ({
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

    const taskDetails = {
      projectId: testProject.id,
      reporterId: project.createdByUserId,
      assigneeId: employee.id,
      daysFromToday: 0,
    };

    const priorities = [
      "LOW",
      "MEDIUM",
      "LOW",
      "URGENT",
      "HIGH",
      "MEDIUM",
    ];

    for (let i = 0; i < priorities.length; i++) {
      await createTask({
        ...taskDetails,
        title: `Focus Limit Task ${i + 1}`,
        priority: priorities[i],
      });
    }

    const response = await internApi.get(ENDPOINT);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.data.focusMode).toBe("DUE_TODAY");
    expect(body.data.focusTasks).toHaveLength(5);

    const returnedPriorities = body.data.focusTasks.map(
      (task) => task.priority
    );

    expect(returnedPriorities).toEqual([
      "URGENT",
      "HIGH",
      "MEDIUM",
      "MEDIUM",
      "LOW",
    ]);
  });

  test("treats null story points as zero", async ({
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
      title: "Task Without Story Points",
      status: "TODO",
      storyPoints: null,
    });

    const response = await internApi.get(ENDPOINT);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.data.workload.activeTasks).toBe(1);
    expect(body.data.workload.activeStoryPoints).toBe(0);
  });

  test("only returns tasks assigned to the authenticated employee", async ({
    internApi,
    adminApi,
    testProject,
  }) => {
    // Get the INTERN's employee details.
    const internResponse = await internApi.get(ENDPOINT);
    const internBody = await internResponse.json();
    const intern = internBody.data.employee;

    // Get the ADMIN's employee details.
    const adminResponse = await adminApi.get(ENDPOINT);
    const adminBody = await adminResponse.json();
    const admin = adminBody.data.employee;

    const project = await prisma.project.findUniqueOrThrow({
      where: { id: testProject.id },
      select: { createdByUserId: true },
    });

    // Create a task assigned to the INTERN.
    await createTask({
      projectId: testProject.id,
      reporterId: project.createdByUserId,
      assigneeId: intern.id,
      title: "Intern Own Task",
      status: "TODO",
      daysFromToday: 0,
    });

    // Create a task assigned to the ADMIN.
    await createTask({
      projectId: testProject.id,
      reporterId: project.createdByUserId,
      assigneeId: admin.id,
      title: "Admin Private Task",
      status: "TODO",
      daysFromToday: 0,
    });

    // Request workload using the INTERN's authentication.
    const response = await internApi.get(ENDPOINT);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.data.workload.activeTasks).toBe(1);
    expect(body.data.focusTasks).toHaveLength(1);
    expect(body.data.focusTasks[0].title).toBe("Intern Own Task");

    expect(
      body.data.focusTasks.some(
        (task) => task.title === "Admin Private Task"
      )
    ).toBe(false);
  });

  test("excludes tasks belonging to deleted projects", async ({
    internApi,
    testProject,
  }) => {
    const employeeResponse = await internApi.get(ENDPOINT);
    const employeeBody = await employeeResponse.json();
    const employee = employeeBody.data.employee;

    const project = await prisma.project.findUniqueOrThrow({
      where: { id: testProject.id },
      select: { createdByUserId: true },
    });

    // Create an active task in the test project.
    await createTask({
      projectId: testProject.id,
      reporterId: project.createdByUserId,
      assigneeId: employee.id,
      title: "Task In Deleted Project",
      status: "TODO",
      daysFromToday: 0,
      storyPoints: 5,
    });

    // Soft-delete the project.
    await prisma.project.update({
      where: { id: testProject.id },
      data: { isDeleted: true },
    });

    // Request the employee's workload.
    const response = await internApi.get(ENDPOINT);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.data.workload.activeTasks).toBe(0);
    expect(body.data.workload.activeStoryPoints).toBe(0);
    expect(body.data.focusTasks).toHaveLength(0);
    expect(body.data.focusMode).toBe("EMPTY");
  });
});
