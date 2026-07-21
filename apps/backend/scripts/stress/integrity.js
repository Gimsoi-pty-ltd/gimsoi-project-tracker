import { rawPrisma as prisma, databasePool } from "../../lib/prisma.js";
import { assertStressDatabase } from "./guard-lib.js";

try {
  assertStressDatabase();
  const [crossProjectParents, analyticsMismatches, missingProjectOwners] = await Promise.all([
    prisma.$queryRaw`
      SELECT COUNT(*)::int AS count
      FROM "Task" child
      JOIN "Task" parent ON parent.id = child."parentTaskId"
      WHERE child."projectId" <> parent."projectId"`,
    prisma.$queryRaw`
      SELECT COUNT(*)::int AS count
      FROM "ProjectAnalytics" analytics
      LEFT JOIN (
        SELECT "projectId", COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status = 'DONE')::int AS completed,
          COUNT(*) FILTER (WHERE status = 'BLOCKED')::int AS blocked
        FROM "Task" WHERE "isDeleted" = false GROUP BY "projectId"
      ) actual ON actual."projectId" = analytics."projectId"
      WHERE analytics."totalTasks" <> COALESCE(actual.total, 0)
         OR analytics."completedTasks" <> COALESCE(actual.completed, 0)
         OR analytics."blockedTasks" <> COALESCE(actual.blocked, 0)`,
    prisma.$queryRaw`
      SELECT COUNT(*)::int AS count FROM "Project" project
      WHERE project."isDeleted" = false AND NOT EXISTS (
        SELECT 1 FROM "ProjectMember" member
        WHERE member."projectId" = project.id AND member.role = 'OWNER'
      )`,
  ]);
  const result = {
    crossProjectParents: crossProjectParents[0].count,
    analyticsMismatches: analyticsMismatches[0].count,
    missingProjectOwners: missingProjectOwners[0].count,
  };
  console.log(JSON.stringify(result));
  if (Object.values(result).some((value) => value !== 0)) process.exitCode = 1;
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
  await databasePool.end();
}
