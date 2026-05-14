# Phase Plan — Urgency Sort

## Objective
Implement urgency-based sorting for the task list API.

---

## Phase 1 — Schema: add sortBy to listTasksSchema
**Objective:** Update the validation schema to allow the `sortBy` parameter.
**Files to Touch:**
- [MODIFY] [task.schema.js](file:///c:/Users/User/Desktop/data_01/gimsoi/gimsoi-project-tracker/apps/backend/schemas/task.schema.js)
**Expected Outcome:** `req.query.sortBy` is correctly validated and coerced by the route middleware.
**Gate:** `npm run test:api` (117 pass)

---

## Phase 2 — Service: compute urgencyScore, sort, and include phase
**Objective:** Implement the scoring logic and sorting in the service layer.
**Files to Touch:**
- [MODIFY] [task.service.js](file:///c:/Users/User/Desktop/data_01/gimsoi/gimsoi-project-tracker/apps/backend/services/task.service.js)
**Logic:**
1. Destructure `sortBy` in `getTasksByProject`.
2. If `sortBy === 'urgency'`, add `phase` to Prisma `include`.
3. Post-fetch: Compute `urgencyScore` for each task.
4. Post-fetch: Sort tasks descending by `urgencyScore`.
5. Ensure `urgencyScore` is only added when `sortBy === 'urgency'`.
**Gate:** `npm run test:api` (117 pass)

---

## Phase 3 — Controller: pass sortBy to service
**Objective:** Pass the `sortBy` parameter from the request query to the service layer.
**Files to Touch:**
- [MODIFY] [task.controller.js](file:///c:/Users/User/Desktop/data_01/gimsoi/gimsoi-project-tracker/apps/backend/controllers/task.controller.js)
**Gate:** `npm run test:api` (117 pass)
