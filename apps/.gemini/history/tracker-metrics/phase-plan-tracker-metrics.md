# Phase Plan: tracker-metrics
**Date:** 2026-05-05
**Classification:** L (Large)
**Total Phases:** 6

---

## Phase 1

**Objective:** Add `goal` to `Sprint`, `storyPoints`/`severity`/`estimatedHours`/`actualHours` to `Task`, add `REVIEW` to `TaskStatus` enum, create `Severity` enum, and run migration.

### Files to Touch
- `prisma/schema.prisma`

### Expected `npm run test:api` Outcome
**Tests expected to PASS:** All 122 existing tests (new fields are additive with defaults)
**New tests added this phase:** None
**Tests expected to be unaffected:** `auth.spec.js`, `clients.spec.js`, `error-handling.spec.js`, `projects.spec.js`, `rbac.spec.js`, `sprints.spec.js`, `task-lifecycle.spec.js`, `tasks.spec.js`

### Rollback Instruction
```bash
git checkout apps/backend/prisma/schema.prisma && npx prisma migrate reset --skip-seed
```

### Recommended Model
**Recommended:** Pro
**Reason:** Schema design touches multiple models and enum relationships — cross-file impact reasoning needed.

---

## Phase 2

**Objective:** Update `ALLOWED_TRANSITIONS` in the task service to include `REVIEW` in the state machine, and update the Zod schemas for tasks and sprints to accept new fields.

### Files to Touch
- `services/task.service.js`
- `schemas/task.schema.js`
- `schemas/sprint.schema.js`

### Expected `npm run test:api` Outcome
**Tests expected to PASS:** All 122 existing tests
**New tests added this phase:** None
**Tests expected to be unaffected:** `auth.spec.js`, `clients.spec.js`, `error-handling.spec.js`, `projects.spec.js`, `rbac.spec.js`

### Rollback Instruction
```bash
git checkout apps/backend/services/task.service.js apps/backend/schemas/task.schema.js apps/backend/schemas/sprint.schema.js
```

### Recommended Model
**Recommended:** Pro
**Reason:** State machine update requires cross-referencing the existing transition table and testing all affected lifecycle paths.

---

## Phase 3

**Objective:** Implement `getSprintMetrics(sprintId)` aggregation logic in the sprint service, updating `getSprintVelocity` to use `storyPoints`.

### Files to Touch
- `services/sprint.service.js`

### Expected `npm run test:api` Outcome
**Tests expected to PASS:** All 122 existing tests
**New tests added this phase:** None
**Tests expected to be unaffected:** All `tasks.spec.js`, `task-lifecycle.spec.js`, `projects.spec.js`

### Rollback Instruction
```bash
git checkout apps/backend/services/sprint.service.js
```

### Recommended Model
**Recommended:** Pro
**Reason:** Aggregation logic requires computing 12+ derived metrics from raw Prisma data — complex arithmetic reasoning needed.

---

## Phase 4

**Objective:** Implement `getSprintMetricsHandler` in the sprint controller and update the existing `getSprintVelocity` handler signature.

### Files to Touch
- `controllers/sprint.controller.js`

### Expected `npm run test:api` Outcome
**Tests expected to PASS:** All 122 existing tests
**New tests added this phase:** None
**Tests expected to be unaffected:** All existing spec files

### Rollback Instruction
```bash
git checkout apps/backend/controllers/sprint.controller.js
```

### Recommended Model
**Recommended:** Flash
**Reason:** Single-file controller change — wire service call to handler, standard pattern.

---

## Phase 5

**Objective:** Register `GET /api/sprints/:id/metrics` on the sprint router and update task and sprint controllers to pass new fields through to their services.

### Files to Touch
- `routes/sprint.route.js`
- `controllers/task.controller.js`

### Expected `npm run test:api` Outcome
**Tests expected to PASS:** All 122 existing tests
**New tests added this phase:** None
**Tests expected to be unaffected:** `auth.spec.js`, `clients.spec.js`, `error-handling.spec.js`

### Rollback Instruction
```bash
git checkout apps/backend/routes/sprint.route.js apps/backend/controllers/task.controller.js
```

### Recommended Model
**Recommended:** Flash
**Reason:** Route wiring follows the established pattern in all other route files.

---

## Phase 6

**Objective:** Write new tests covering the `/metrics` endpoint (auth, happy path, 404 on invalid sprint) and update existing sprint/task tests to cover new fields.

### Files to Touch
- `tests/api/sprints.spec.js`
- `tests/api/tasks.spec.js`

### Expected `npm run test:api` Outcome
**Tests expected to PASS:** All 122 existing + new metrics tests
**New tests added this phase:** `GET /api/sprints/:id/metrics` — authenticated happy path, 401, 403 for INTERN, 404 for invalid sprint
**Tests expected to be unaffected:** `auth.spec.js`, `clients.spec.js`, `error-handling.spec.js`, `projects.spec.js`, `rbac.spec.js`

### Rollback Instruction
```bash
git checkout apps/backend/tests/api/sprints.spec.js apps/backend/tests/api/tasks.spec.js
```

### Recommended Model
**Recommended:** Flash
**Reason:** Test writing follows established Playwright patterns already in the repo.
