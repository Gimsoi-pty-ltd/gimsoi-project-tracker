# Phase Plan: Test Stabilization

**Total Phases:** 3
**Baseline:** 93 tests passing, 10 failing

---

## Phase 1

**Objective:** Robustify the global error handler in `server.js` to handle Zod and Prisma validation errors as 400s.

### Files to Touch

- `apps/backend/server.js`

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All 93 baseline tests. 
**Tests expected to be affected:** `tests/api/task-lifecycle.spec.js` (unknown status test should now return 400 instead of 500).

### Rollback Instruction

```bash
git checkout apps/backend/server.js
```

### Recommended Model

**Recommended:** Flash
**Reason:** Single file logic update.

---

## Phase 2

**Objective:** Fix `completedAt` tracking and status transition guards in `task.service.js`.

### Files to Touch

- `apps/backend/services/task.service.js`

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** Previous tests + `tests/api/tasks.spec.js` (completedAt tracking) and `tests/api/sprints.spec.js`.

### Rollback Instruction

```bash
git checkout apps/backend/services/task.service.js
```

### Recommended Model

**Recommended:** Flash
**Reason:** Focused service layer changes.

---

## Phase 3

**Objective:** Fix undefined variables and RBAC edge cases in `users.spec.js`.

### Files to Touch

- `apps/backend/tests/api/users.spec.js`

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All 103 tests.

### Rollback Instruction

```bash
git checkout apps/backend/tests/api/users.spec.js
```

### Recommended Model

**Recommended:** Flash
**Reason:** Test file cleanup.
