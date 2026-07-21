import { assertStressDatabase } from "./guard-lib.js";

try {
  const target = assertStressDatabase();
  console.log(`Stress database guard passed (${target.host}, ${target.fingerprintPrefix}…).`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
