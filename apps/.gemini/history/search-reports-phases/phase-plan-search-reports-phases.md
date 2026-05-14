# Phase Plan: `feat/search-reports-phases`

**Feature:** Search, Reports, and Phases
**Total Phases:** 5
**Baseline:** 93 tests passing

---

## Phase 1

**Objective:** Extend the Prisma schema with the `Phase` and `Report` models, add `phaseId` to `Task`, run the migration, and regenerate the Prisma client.

---

### Files to Touch

- `prisma/schema.prisma`

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All 93 existing tests. Schema changes are additive (new models + optional FK on Task).
**New tests added this phase:** None.
**Tests expected to be unaffected:** `auth.spec.js`, `clients.spec.js`, `sprints.spec.js`, `rbac.spec.js`, `tasks.spec.js`, `users.spec.js`, `projects.spec.js`, `error-handling.spec.js`

---

### Rollback Instruction

```bash
git checkout apps/backend/prisma/schema.prisma && npx prisma db push --force-reset && node prisma/seed.js
```

---

### Recommended Model

**Recommended:** Pro
**Reason:** Schema additions span multiple models with relational dependencies — requires careful cross-model reasoning.

---

## Phase 2

**Objective:** Install `pdfkit`, implement the `Phase` service and controller, register the `/api/phases` router, and add `MANAGE_PHASES` and `VIEW_PHASES` permissions.

---

### Files to Touch

- `constants/permissions.js`
- `services/phase.service.js` (new)
- `controllers/phase.controller.js` (new)
- `routes/phase.route.js` (new)
- `server.js`

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All 93 baseline tests.
**New tests added this phase:** None (test file added in Phase 5).
**Tests expected to be unaffected:** All existing spec files.

---

### Rollback Instruction

```bash
git checkout apps/backend/constants/permissions.js apps/backend/server.js
git rm apps/backend/services/phase.service.js apps/backend/controllers/phase.controller.js apps/backend/routes/phase.route.js
```

---

### Recommended Model

**Recommended:** Pro
**Reason:** New service, controller, and route must follow established layer boundary rules and reuse the exact existing permission, error, and pagination patterns.

---

## Phase 3

**Objective:** Implement the `Report` model service, PDF generation utility using `pdfkit`, and register the `/api/reports` router with `POST /reports` and `GET /reports/:id/pdf`.

---

### Files to Touch

- `utils/pdf.js` (new)
- `services/report.service.js` (new)
- `controllers/report.controller.js` (new)
- `routes/report.route.js` (new)
- `server.js`

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All 93 baseline tests.
**New tests added this phase:** None (PDF tests are integration-validated in Phase 5).
**Tests expected to be unaffected:** All existing spec files.

---

### Rollback Instruction

```bash
git checkout apps/backend/server.js
git rm apps/backend/utils/pdf.js apps/backend/services/report.service.js apps/backend/controllers/report.controller.js apps/backend/routes/report.route.js
```

---

### Recommended Model

**Recommended:** Pro
**Reason:** PDF binary streaming and report aggregation logic requires careful implementation to avoid memory issues.

---

## Phase 4

**Objective:** Implement global search aggregation (`GET /api/search?q=&type=`) and team analytics (`GET /api/analytics/team`), creating the new `analytics.route.js` and `search.route.js`.

---

### Files to Touch

- `services/search.service.js` (new)
- `controllers/search.controller.js` (new)
- `routes/search.route.js` (new)
- `services/analytics.service.js` (new)
- `controllers/analytics.controller.js` (new)
- `routes/analytics.route.js` (new)
- `server.js`

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All 93 baseline tests.
**New tests added this phase:** None.
**Tests expected to be unaffected:** All existing spec files.

---

### Rollback Instruction

```bash
git checkout apps/backend/server.js
git rm apps/backend/services/search.service.js apps/backend/controllers/search.controller.js apps/backend/routes/search.route.js
git rm apps/backend/services/analytics.service.js apps/backend/controllers/analytics.controller.js apps/backend/routes/analytics.route.js
```

---

### Recommended Model

**Recommended:** Pro
**Reason:** Cross-table search aggregation with parallel Prisma queries requires careful performance reasoning.

---

## Phase 5

**Objective:** Add `GET /api/sprints/:id/velocity` to the existing sprint router and write the full API integration test suite covering all 5 new capabilities.

---

### Files to Touch

- `services/sprint.service.js`
- `controllers/sprint.controller.js`
- `routes/sprint.route.js`
- `tests/api/search-reports-phases.spec.js` (new)

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All 93 baseline + all new tests in `search-reports-phases.spec.js`.
**New tests added this phase:** ~15 new tests covering: global search, phase CRUD, report creation, PDF download, team analytics, and sprint velocity.
**Tests expected to be unaffected:** All existing spec files must remain green.

---

### Rollback Instruction

```bash
git checkout apps/backend/services/sprint.service.js apps/backend/controllers/sprint.controller.js apps/backend/routes/sprint.route.js
git rm apps/backend/tests/api/search-reports-phases.spec.js
```

---

### Recommended Model

**Recommended:** Pro
**Reason:** Integration test design spans 5 new API surfaces with interdependent setup/teardown logic.
