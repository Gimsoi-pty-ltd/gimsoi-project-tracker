import bcryptjs from "bcryptjs";
import { rawPrisma as prisma, databasePool } from "../../lib/prisma.js";
import { assertStressDatabase } from "./guard-lib.js";

const PREFIX = "stress";
const DAY = 86_400_000;
const now = new Date();
const dateAt = (offsetDays) => new Date(now.getTime() + offsetDays * DAY);
const chunked = (items, size = 500) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
};

async function createInChunks(model, rows) {
  await Promise.all(chunked(rows).map((chunk) => model.createMany({ data: chunk })));
}

try {
  assertStressDatabase();
  const password = process.env.STRESS_TEST_PASSWORD || "StressTest123!";
  const passwordHash = await bcryptjs.hash(password, 8);

  const userRows = Array.from({ length: 40 }, (_, index) => ({
    email: `${PREFIX}.user.${String(index).padStart(2, "0")}@gimsoi.test`,
    fullName: `Stress User ${String(index).padStart(2, "0")}`,
    password: passwordHash,
    role: index === 0 ? "ADMIN" : index < 8 ? "PM" : index < 32 ? "INTERN" : "CLIENT",
    isVerified: true,
  }));
  await prisma.user.createMany({ data: userRows, skipDuplicates: true });
  const users = await prisma.user.findMany({ where: { email: { startsWith: `${PREFIX}.user.` } }, orderBy: { email: "asc" } });

  await prisma.client.createMany({
    data: Array.from({ length: 12 }, (_, index) => ({
      name: `Stress Client ${String(index).padStart(2, "0")}`,
      contactEmail: `${PREFIX}.client.${index}@gimsoi.test`,
      createdByUserId: users[0].id,
    })),
  });
  const clients = await prisma.client.findMany({ where: { name: { startsWith: "Stress Client" } }, orderBy: { name: "asc" } });

  await prisma.project.createMany({
    data: Array.from({ length: 30 }, (_, index) => ({
      name: `Stress Project ${String(index).padStart(2, "0")}`,
      description: `Synthetic stress project ${index}`,
      status: index % 10 === 0 ? "DRAFT" : "ACTIVE",
      clientId: clients[index % clients.length].id,
      createdByUserId: users[1 + (index % 7)].id,
      startDate: dateAt(-90 + index),
      endDate: dateAt(90 + index),
      milestones: `Stress milestone ${index}`,
      setupNotes: "Synthetic data; safe to reset.",
    })),
  });
  const projects = await prisma.project.findMany({ where: { name: { startsWith: "Stress Project" } }, orderBy: { name: "asc" } });

  const memberships = [];
  for (let projectIndex = 0; projectIndex < projects.length; projectIndex++) {
    const memberIds = new Set([users[0].id, users[1 + (projectIndex % 7)].id]);
    for (let offset = 0; offset < 8; offset++) memberIds.add(users[8 + ((projectIndex * 3 + offset) % 24)].id);
    for (const userId of memberIds) memberships.push({
      projectId: projects[projectIndex].id,
      userId,
      role: userId === users[1 + (projectIndex % 7)].id ? "OWNER" : "MEMBER",
    });
  }
  await createInChunks(prisma.projectMember, memberships);

  const phaseRows = [];
  const sprintRows = [];
  const labelRows = [];
  for (const [projectIndex, project] of projects.entries()) {
    for (let phaseIndex = 0; phaseIndex < 5; phaseIndex++) phaseRows.push({
      name: `Stress Phase ${phaseIndex + 1}`,
      description: "Synthetic stress phase",
      status: phaseIndex < 2 ? "COMPLETED" : phaseIndex === 2 ? "ACTIVE" : "DRAFT",
      order: phaseIndex,
      projectId: project.id,
      startDate: dateAt(-60 + phaseIndex * 20),
      endDate: dateAt(-40 + phaseIndex * 20),
    });
    for (let sprintIndex = 0; sprintIndex < 3; sprintIndex++) sprintRows.push({
      name: `Stress Sprint ${sprintIndex + 1}`,
      goal: "Exercise representative project work",
      status: sprintIndex === 0 ? "CLOSED" : sprintIndex === 1 ? "ACTIVE" : "PLANNING",
      projectId: project.id,
      createdByUserId: users[1 + (projectIndex % 7)].id,
      startDate: dateAt((sprintIndex - 1) * 14),
      endDate: dateAt(sprintIndex * 14),
    });
    for (let labelIndex = 0; labelIndex < 3; labelIndex++) labelRows.push({
      name: `Stress Label ${labelIndex + 1}`,
      color: ["#2563EB", "#DC2626", "#16A34A"][labelIndex],
      projectId: project.id,
    });
  }
  await createInChunks(prisma.phase, phaseRows);
  await createInChunks(prisma.sprint, sprintRows);
  await createInChunks(prisma.label, labelRows);
  const phases = await prisma.phase.findMany({ where: { name: { startsWith: "Stress Phase" } }, orderBy: [{ projectId: "asc" }, { order: "asc" }] });
  const sprints = await prisma.sprint.findMany({ where: { name: { startsWith: "Stress Sprint" } }, orderBy: [{ projectId: "asc" }, { startDate: "asc" }] });

  const phasesByProject = Map.groupBy(phases, (phase) => phase.projectId);
  const sprintsByProject = Map.groupBy(sprints, (sprint) => sprint.projectId);
  const memberIdsByProject = new Map();
  for (const membership of memberships) {
    const ids = memberIdsByProject.get(membership.projectId) || [];
    ids.push(membership.userId);
    memberIdsByProject.set(membership.projectId, ids);
  }

  const taskRows = [];
  for (const [projectIndex, project] of projects.entries()) {
    const projectPhases = phasesByProject.get(project.id);
    const projectSprints = sprintsByProject.get(project.id);
    const projectMembers = memberIdsByProject.get(project.id);
    for (let taskIndex = 0; taskIndex < 100; taskIndex++) {
      const status = ["TODO", "IN_PROGRESS", "REVIEW", "DONE", "BLOCKED"][taskIndex % 5];
      taskRows.push({
        title: `Stress Task ${String(projectIndex).padStart(2, "0")}-${String(taskIndex).padStart(3, "0")}`,
        description: "Synthetic task generated for repeatable stress testing.",
        status,
        storyPoints: (taskIndex % 8) + 1,
        sprintId: projectSprints[taskIndex % 3].id,
        projectId: project.id,
        phaseId: projectPhases[taskIndex % 5].id,
        assigneeId: projectMembers[taskIndex % projectMembers.length],
        reporterId: users[1 + (projectIndex % 7)].id,
        ownerIds: [projectMembers[taskIndex % projectMembers.length]],
        teamIds: projectMembers.slice(0, 3),
        completedAt: status === "DONE" ? dateAt(-(taskIndex % 30)) : null,
        priority: ["LOW", "MEDIUM", "HIGH", "URGENT"][taskIndex % 4],
        isBlocked: status === "BLOCKED",
        dueDate: dateAt((taskIndex % 60) - 20),
      });
    }
  }
  await createInChunks(prisma.task, taskRows);
  const tasks = await prisma.task.findMany({ where: { title: { startsWith: "Stress Task" } }, orderBy: { title: "asc" } });

  await createInChunks(prisma.comment, tasks.filter((_, index) => index % 5 === 0).map((task, index) => ({
    content: `Synthetic stress comment ${index}`,
    taskId: task.id,
    userId: users[index % 32].id,
  })));
  await createInChunks(prisma.activityLog, tasks.filter((_, index) => index % 2 === 0).map((task, index) => ({
    taskId: task.id,
    userId: users[index % 32].id,
    action: "STRESS_SEED_CREATED",
    entityId: task.id,
    entityType: "Task",
  })));

  const analytics = projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    const projectSprints = sprintsByProject.get(project.id);
    return {
      projectId: project.id,
      totalTasks: projectTasks.length,
      completedTasks: projectTasks.filter((task) => task.status === "DONE").length,
      blockedTasks: projectTasks.filter((task) => task.status === "BLOCKED").length,
      cancelledTasks: projectTasks.filter((task) => task.status === "CANCELLED").length,
      totalSprints: projectSprints.length,
      activeSprints: projectSprints.filter((sprint) => sprint.status === "ACTIVE").length,
      syncStatus: "stress-seeded",
    };
  });
  await prisma.projectAnalytics.createMany({ data: analytics });

  console.log(JSON.stringify({ users: users.length, clients: clients.length, projects: projects.length, sprints: sprints.length, phases: phases.length, tasks: tasks.length }));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
  await databasePool.end();
}
