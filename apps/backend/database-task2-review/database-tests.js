import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const schemaPath = fileURLToPath(
  new URL('./schema.proposed.prisma', import.meta.url)
);

const migrationPath = fileURLToPath(
  new URL('./migration.proposed.sql', import.meta.url)
);

const schema = readFileSync(schemaPath, 'utf8');
const migration = readFileSync(migrationPath, 'utf8');

function getModel(name) {
  const match = schema.match(
    new RegExp(`model ${name} \\{([\\s\\S]*?)\\n\\}`)
  );

  assert.ok(match, `Missing model: ${name}`);
  return match[1];
}

function runTest(name, test) {
  test();
  console.log(`PASS: ${name}`);
}

runTest('User email uniqueness', () => {
  assert.match(getModel('User'), /email\s+String\s+@unique/);
});

runTest('Project membership uniqueness', () => {
  assert.match(
    getModel('ProjectMember'),
    /@@unique\(\[projectId,\s*userId\]\)/
  );
});

runTest('Task risk fields', () => {
  const task = getModel('Task');

  assert.match(task, /priority\s+TaskPriority/);
  assert.match(task, /isBlocked\s+Boolean/);
  assert.match(task, /dueDate\s+DateTime\?/);
});

runTest('Task project relationship', () => {
  const task = getModel('Task');

  assert.match(task, /projectId\s+String/);
  assert.match(task, /project\s+Project\s+@relation/);
});

runTest('Proposed risk indexes', () => {
  const task = getModel('Task');

  for (const index of [
    '@@index([projectId, status])',
    '@@index([projectId, dueDate])',
    '@@index([projectId, isBlocked])'
  ]) {
    assert.ok(task.includes(index), `Missing index: ${index}`);
  }
});

runTest('SQL migration contains five indexes', () => {
  const indexes = migration.match(/CREATE INDEX/g) ?? [];

  assert.equal(indexes.length, 5);
});

console.log('\nAll static database checks passed.');