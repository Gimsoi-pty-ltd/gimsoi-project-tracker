import { rawPrisma, databasePool } from "../../lib/prisma.js";
import { assertStressDatabase } from "./guard-lib.js";

const tables = [
  '"ActivityLog"', '"Comment"', '"_LabelToTask"', '"Label"', '"Task"',
  '"ProjectAnalytics"', '"Sprint"', '"Phase"', '"Report"',
  '"ProjectMember"', '"Project"', '"Client"', '"User"'
];

try {
  const target = assertStressDatabase({ destructive: true });
  console.log(`Resetting guarded stress database (${target.fingerprintPrefix}…).`);
  await rawPrisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables.join(", ")} CASCADE;`);
  console.log("Stress database reset complete.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await rawPrisma.$disconnect();
  await databasePool.end();
}
