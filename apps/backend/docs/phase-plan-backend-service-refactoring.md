# Phase Plan: Backend Service Refactoring

## Phase 1

**Objective:** Abstract Prisma concurrency error mapping into a reusable utility in `prismaErrors.js`.

---

### Files to Touch

- `utils/prismaErrors.js`

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All existing tests in `tests/api/error-handling.spec.js`.
**New tests added this phase:** None.
**Tests expected to be unaffected:** All other test files in `tests/api/`.

---

### Rollback Instruction

```bash
git checkout utils/prismaErrors.js
```

---

### Recommended Model

**Recommended:** Flash
**Reason:** Single-file utility change with well-defined requirements.

---

## Phase 2

**Objective:** Implement standardized concurrency error handling in `sprint.service.js` using the Phase 1 utility.

---

### Files to Touch

- `services/sprint.service.js`

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All existing tests in `tests/api/sprints.spec.js`.
**New tests added this phase:** None.
**Tests expected to be unaffected:** All other test files in `tests/api/`.

---

### Rollback Instruction

```bash
git checkout services/sprint.service.js
```

---

### Recommended Model

**Recommended:** Flash
**Reason:** Single-file service logic refactoring.

---

## Phase 3

**Objective:** Simplify Task service field mappings and implement standardized concurrency error handling in `task.service.js`.

---

### Files to Touch

- `services/task.service.js`

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All existing tests in `tests/api/tasks.spec.js`, `tests/api/task-lifecycle.spec.js`, and `tests/api/rbac.spec.js`.
**New tests added this phase:** None.
**Tests expected to be unaffected:** All other test files in `tests/api/`.

---

### Rollback Instruction

```bash
git checkout services/task.service.js
```

---

### Recommended Model

**Recommended:** Flash
**Reason:** Single-file service logic refactoring involving field mapping and error handling.

---

## Phase 4

**Objective:** Eliminate redundant object literals in the Project service upsert logic.

---

### Files to Touch

- `services/project.service.js`

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All existing tests in `tests/api/projects.spec.js`.
**New tests added this phase:** None.
**Tests expected to be unaffected:** All other test files in `tests/api/`.

---

### Rollback Instruction

```bash
git checkout services/project.service.js
```

---

### Recommended Model

**Recommended:** Flash
**Reason:** Single-file service refactoring of redundant object literals.

---

## Phase 5

**Objective:** Optimize report generation logic using single-pass array traversals in `report.service.js`.

---

### Files to Touch

- `services/report.service.js`

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All existing tests in `tests/api/reports-upgrade.spec.js`.
**New tests added this phase:** None.
**Tests expected to be unaffected:** All other test files in `tests/api/`.

---

### Rollback Instruction

```bash
git checkout services/report.service.js
```

---

### Recommended Model

**Recommended:** Flash
**Reason:** Single-file performance optimization using functional programming patterns.
