import { rawPrisma as prisma, databasePool } from "../../lib/prisma.js";
import { assertStressDatabase } from "./guard-lib.js";

try {
  assertStressDatabase();
  const [users, clients, projects, sprints, phases, tasks, comments, activities] = await Promise.all([
    prisma.user.count(), prisma.client.count(), prisma.project.count(), prisma.sprint.count(),
    prisma.phase.count(), prisma.task.count(), prisma.comment.count(), prisma.activityLog.count(),
  ]);
  console.log(JSON.stringify({ users, clients, projects, sprints, phases, tasks, comments, activities }));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
  await databasePool.end();
}
