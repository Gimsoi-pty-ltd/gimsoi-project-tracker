# Phase Plan — feat/user-admin

**Feature:** User Administration
**PRD:** docs/prd-user-admin.md
**Classification:** L
**Total phases:** 5
**Generated:** 2026-04-28

---

## Phase 1

**Objective:** Add MANAGE_USERS and VIEW_USERS permissions to the permissions matrix and implement all user service functions.

### Files to Touch
- `apps/backend/constants/permissions.js`
- `apps/backend/services/user.service.js` [NEW]

### Expected `npm run test:api` Outcome
**Tests expected to PASS:** All existing tests (auth, clients, projects, sprints, tasks, rbac, error-handling, task-lifecycle)
**New tests added this phase:** None
**Tests expected to be unaffected:** All

### Rollback Instruction
```bash
git checkout apps/backend/constants/permissions.js
git rm apps/backend/services/user.service.js
```

### Recommended Model
**Recommended:** Pro
**Reason:** New permissions constants affect global RBAC; service layer must correctly handle P2025/P2002 across 5 functions.

---

## Phase 2

**Objective:** Create all Zod validation schemas for user endpoint request bodies, params, and query strings.

### Files to Touch
- `apps/backend/schemas/user.schema.js` [NEW]

### Expected `npm run test:api` Outcome
**Tests expected to PASS:** All existing tests
**New tests added this phase:** None
**Tests expected to be unaffected:** All

### Rollback Instruction
```bash
git rm apps/backend/schemas/user.schema.js
```

### Recommended Model
**Recommended:** Flash
**Reason:** Single-file schema creation, no cross-layer reasoning required.

---

## Phase 3

**Objective:** Create the user controller, user route file, and register the router in server.js — wiring GET /users, POST /users, PATCH /:id/role, and PATCH /me.

### Files to Touch
- `apps/backend/controllers/user.controller.js` [NEW]
- `apps/backend/routes/user.route.js` [NEW]
- `apps/backend/server.js`

### Expected `npm run test:api` Outcome
**Tests expected to PASS:** All existing tests. Monitor rbac.spec.js and auth.spec.js closely.
**New tests added this phase:** None
**Tests expected to be unaffected:** clients, sprints, tasks, task-lifecycle, error-handling

### Rollback Instruction
```bash
git checkout apps/backend/server.js
git rm apps/backend/controllers/user.controller.js
git rm apps/backend/routes/user.route.js
```

### Recommended Model
**Recommended:** Pro
**Reason:** Cross-layer change spanning controller, route, and server registration simultaneously.

---

## Phase 4

**Objective:** Install multer, create upload utility, and add POST /users/me/avatar to the route.

⚠️ DEPENDENCY APPROVAL GATE: This phase does not begin until the user types "Confirmed" to approve `npm install multer`.

### Files to Touch
- `apps/backend/utils/upload.js` [NEW]
- `apps/backend/routes/user.route.js`
- `apps/backend/package.json` (updated by npm install)
- `apps/backend/package-lock.json` (updated by npm install)

### Expected `npm run test:api` Outcome
**Tests expected to PASS:** All existing tests + avatar upload endpoint returns 200
**New tests added this phase:** None
**Tests expected to be unaffected:** All existing tests

### Rollback Instruction
```bash
git checkout apps/backend/routes/user.route.js apps/backend/package.json apps/backend/package-lock.json
git rm apps/backend/utils/upload.js
npm install
```

### Recommended Model
**Recommended:** Flash
**Reason:** Single-responsibility utility file plus one additional route line.

---

## Phase 5

**Objective:** Add Playwright API integration tests for all 6 user admin capabilities.

### Files to Touch
- `apps/backend/tests/api/users.spec.js` [NEW]

### Expected `npm run test:api` Outcome
**Tests expected to PASS:** All existing tests + new users.spec.js suite
**New tests added this phase:** ~12–16 new test cases
**Tests expected to be unaffected:** All existing spec files

### Rollback Instruction
```bash
git rm apps/backend/tests/api/users.spec.js
```

### Recommended Model
**Recommended:** Flash
**Reason:** New test file only; no source changes.
