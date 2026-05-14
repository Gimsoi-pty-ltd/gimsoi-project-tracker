# Phase Plan: project-membership
**Feature:** Project Membership Model and API
**Classification:** L (Large)
**Generated:** 2026-04-29

---

## Phase 1

**Objective:** Add the `MemberRole` enum and `ProjectMember` model to the Prisma schema, run the migration, and regenerate the Prisma client — no business logic changes.

---

### Files to Touch

- `prisma/schema.prisma`

---

### What to change in schema.prisma

Add after the existing `Role` enum:

```prisma
enum MemberRole {
  OWNER
  MEMBER
  VIEWER
}
```

Add the new model after the `Comment` model:

```prisma
model ProjectMember {
  id        String     @id @default(uuid())
  projectId String
  project   Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId    String
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      MemberRole @default(MEMBER)
  createdAt DateTime   @default(now())

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
}
```

Add to the `Project` model relation block:
```
  members ProjectMember[]
```

Add to the `User` model relation block:
```
  projectMemberships ProjectMember[]
```

After editing schema, run:
```bash
npx prisma migrate dev --name add-project-member
npx prisma generate
```

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All 105 existing tests — schema addition is purely additive, no existing queries are affected.
**New tests added this phase:** None.
**Tests expected to be unaffected:** auth.spec.js, clients.spec.js, error-handling.spec.js, projects.spec.js, rbac.spec.js, search-reports-phases.spec.js, sprints.spec.js, task-lifecycle.spec.js, tasks.spec.js, users.spec.js

---

### Rollback Instruction

```bash
git checkout apps/backend/prisma/schema.prisma
npx prisma migrate reset --skip-seed
npx prisma generate
```

---

### Recommended Model

**Recommended:** Flash
**Reason:** Mechanical schema addition — no business logic, just model definition and migration command.

---

## Phase 2

**Objective:** Implement the full project membership service layer — create, list, update role, delete, and the `assertProjectMembership` guard helper — and retrofit `project.service.js` to auto-enroll the creator as OWNER on project creation.

---

### Files to Touch

- `utils/membership.js` (NEW)
- `services/projectMember.service.js` (NEW)
- `services/project.service.js` (MODIFY — auto-enroll in createProject)

---

### What to implement

**`utils/membership.js`** — export `assertProjectMembership(projectId, userId, userRole)`:
- If `userRole` is `ADMIN` or `PROJECT_MANAGER` (from `constants/roles.js`), return true immediately.
- Query `prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } })`.
- If not found, throw `ForbiddenError('You are not a member of this project.')`.
- Return the membership record.

**`services/projectMember.service.js`** — export:
- `addMember({ projectId, userId, role })` — creates a `ProjectMember` record; catches Prisma `P2002` unique constraint and throws `ConflictError('User is already a member of this project.')`.
- `getMembersByProject(projectId)` — returns all members with `include: { user: { select: { id, fullName, email, avatarUrl, role } } }`, ordered by `createdAt asc`.
- `updateMemberRole({ projectId, userId, role })` — updates the `role` field; throws `NotFoundError` if record not found (P2025).
- `removeMember({ projectId, userId })` — deletes the record; throws `NotFoundError` if not found.

**`services/project.service.js` `createProject`** — wrap the existing `prisma.project.create` in a `prisma.$transaction([...])` that also runs `prisma.projectMember.create({ data: { projectId: project.id, userId: createdByUserId, role: 'OWNER' } })`. Must be atomic.

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All 105 existing tests — no routes have changed yet, no existing service signatures changed. The auto-enroll addition is transparent to all existing tests because existing tests don't check for membership records.
**New tests added this phase:** None (service layer tested via integration in Phase 5).
**Tests expected to be unaffected:** All existing spec files.

---

### Rollback Instruction

```bash
git checkout apps/backend/services/project.service.js
git rm apps/backend/utils/membership.js
git rm apps/backend/services/projectMember.service.js
```

---

### Recommended Model

**Recommended:** Pro
**Reason:** Service transaction design (auto-enroll) and the membership guard helper require cross-file reasoning across prisma client, error contracts, and the ownership pattern.

---

## Phase 3

**Objective:** Add the membership guard calls to `task.service.js`, `phase.service.js`, and `sprint.service.js` so that non-member, non-ADMIN, non-PM users receive 403 on project-scoped resource access, and so that `createTask` validates the assignee is a project member.

---

### Files to Touch

- `services/task.service.js` (MODIFY — `getTasksByProject` + `createTask`)
- `services/phase.service.js` (MODIFY — `getPhasesByProject`, `getPhaseById`, `createPhase`)
- `services/sprint.service.js` (MODIFY — `getSprintsByProject`, `createSprint`)

---

### What to change

**`task.service.js` — `getTasksByProject`:**
- After the existing `!projectId` guard, add: if `projectId` is provided and requestingUser is INTERN or CLIENT, call `assertProjectMembership(projectId, requestingUser.id, requestingUser.role)`.

**`task.service.js` — `createTask`:**
- After verifying the project exists, if `assigneeId` is provided: call `assertProjectMembership(projectId, assigneeId, null)` but using a direct DB check — `assertProjectMembership` must accept a `skipRoleBypass: true` flag so the ADMIN/PM bypass does NOT apply when checking the assignee (the assignee might be an INTERN who is a valid member). Alternative: write a separate `requireMembership(projectId, userId)` that always checks the DB without role bypass.

**`phase.service.js` — `getPhasesByProject`, `getPhaseById`, `createPhase`, `updatePhase`, `deletePhase`:**
- Replace the `assertOwnership(project, userId, userRole)` call pattern with `assertProjectMembership(projectId, userId, userRole)` for read operations (`getPhasesByProject`, `getPhaseById`).
- For write operations (`createPhase`, `updatePhase`, `deletePhase`): keep `assertOwnership` OR introduce a separate write guard — `assertOwnership` already correctly gates ADMIN/PM vs others; the membership guard is the additional check for INTERN/CLIENT reads.

**`sprint.service.js` — `getSprintsByProject`:**
- Add `requestingUser` param; call `assertProjectMembership(projectId, requestingUser.id, requestingUser.role)` if the user is INTERN or CLIENT.

**`sprint.service.js` — `createSprint`:**
- No assignee involved; membership guard on sprint creation is an OWNER/MEMBER concern — for now, rely on RBAC (only ADMIN/PM can call `createSprint` via route authorize middleware); no service-level change needed for sprint create.

> **CRITICAL NOTE for test compatibility:** `tasks.spec.js` and `rbac.spec.js` have test setups where a PM creates a project and either the SAME PM or an INTERN accesses it. After Phase 2, the PM is auto-enrolled as OWNER. For tests where an INTERN must access tasks or phases, the test's `beforeAll` must enroll the INTERN as a MEMBER via the new `POST /api/projects/:id/members` route (which lands in Phase 4). This means Phase 3 WILL break some existing tests until Phase 4 + Phase 5 (test surgery) complete. This is acceptable: the workflow gates on test pass only at the END of the complete phase plan.

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** auth.spec.js, clients.spec.js, error-handling.spec.js, projects.spec.js, search-reports-phases.spec.js, users.spec.js (membership guards don't affect these paths)
**Tests EXPECTED TO FAIL (acceptable — will be fixed in Phase 5):**
  - `tests/api/rbac.spec.js` — INTERN accessing tasks on a project they are not a member of will now get 403.
  - `tests/api/tasks.spec.js` — Some task access tests may fail if the accessing user isn't enrolled.
  - `tests/api/sprints.spec.js` — Sprint access by INTERN may fail.
**New tests added this phase:** None.

---

### Rollback Instruction

```bash
git checkout apps/backend/services/task.service.js apps/backend/services/phase.service.js apps/backend/services/sprint.service.js
```

---

### Recommended Model

**Recommended:** Pro
**Reason:** Retrofitting guards across 3 services with careful logic around the ADMIN/PM bypass and the assignee-check edge case requires cross-file reasoning.

---

## Phase 4

**Objective:** Wire the membership API — Zod schema, controller, and routes — so that `POST/GET/PATCH/DELETE /api/projects/:id/members` are live and functional.

---

### Files to Touch

- `schemas/projectMember.schema.js` (NEW)
- `controllers/projectMember.controller.js` (NEW)
- `routes/project.route.js` (MODIFY — add 4 member sub-routes)
- `server.js` (NO CHANGE — project router is already mounted at `/api/projects`)
- `constants/permissions.js` (MODIFY — ensure `MANAGE_MEMBERS` and `VIEW_MEMBERS` permissions exist, or reuse `MANAGE_PROJECTS` and `VIEW_PROJECTS`)

---

### What to implement

**`schemas/projectMember.schema.js`:**
```js
export const addMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['OWNER', 'MEMBER', 'VIEWER']).default('MEMBER')
});
export const updateMemberRoleSchema = z.object({
  role: z.enum(['OWNER', 'MEMBER', 'VIEWER'])
});
```

**`controllers/projectMember.controller.js`:** — standard thin controller pattern:
- `addMemberHandler` → calls `addMember`, returns 201
- `getMembersHandler` → calls `getMembersByProject`, returns 200 + array
- `updateMemberRoleHandler` → calls `updateMemberRole`, returns 200
- `removeMemberHandler` → calls `removeMember`, returns 204

**`routes/project.route.js`** — add after existing routes:
```js
router.post('/:id/members', writeLimiter, verifyToken, authorize('MANAGE_PROJECTS'), requireCSRF, validate(addMemberSchema), addMemberHandler);
router.get('/:id/members', readLimiter, verifyToken, authorize('VIEW_PROJECTS'), getMembersHandler);
router.patch('/:id/members/:userId', writeLimiter, verifyToken, authorize('MANAGE_PROJECTS'), requireCSRF, validate(updateMemberRoleSchema), updateMemberRoleHandler);
router.delete('/:id/members/:userId', writeLimiter, verifyToken, authorize('MANAGE_PROJECTS'), requireCSRF, removeMemberHandler);
```

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All tests that were passing at end of Phase 3 continue to pass.
**Tests expected to FAIL (still acceptable):** Same rbac.spec.js and tasks.spec.js failures from Phase 3 — these need test surgery in Phase 5.
**New tests added this phase:** None (membership API tested in Phase 5).

---

### Rollback Instruction

```bash
git checkout apps/backend/routes/project.route.js apps/backend/constants/permissions.js
git rm apps/backend/schemas/projectMember.schema.js
git rm apps/backend/controllers/projectMember.controller.js
```

---

### Recommended Model

**Recommended:** Flash
**Reason:** Controller and route wiring is mechanical pattern work — follows established project.controller.js and phase.controller.js conventions exactly.

---

## Phase 5

**Objective:** Write the membership integration test file and repair all test setups in rbac.spec.js, tasks.spec.js, and sprints.spec.js that break due to membership guards, so that all 105+ tests pass.

---

### Files to Touch

- `tests/api/members.spec.js` (NEW)
- `tests/api/rbac.spec.js` (MODIFY — enroll INTERN where they need project access)
- `tests/api/tasks.spec.js` (MODIFY — enroll users where needed in beforeAll)
- `tests/api/sprints.spec.js` (MODIFY — verify PM auto-enrolled as OWNER covers all sprint tests)

---

### What to add/fix

**`tests/api/members.spec.js`** — new test cases covering all 15 acceptance criteria:
- ADMIN adds a user as MEMBER → 201
- Duplicate add → 409
- INTERN attempts add → 403
- Unauthenticated add → 401
- Invalid role → 400
- GET members → 200, array includes userId/fullName/email/avatarUrl/role
- PATCH member role → 200 with updated role
- PATCH by INTERN → 403
- DELETE member → 204
- DELETE by INTERN → 403
- GET tasks by non-member INTERN → 403
- GET tasks by enrolled INTERN → 200
- POST task with non-member assigneeId → 400
- GET members for non-existent project → 404
- Auto-enroll: after POST /api/projects, GET /api/projects/:id/members includes creator as OWNER

**`tests/api/rbac.spec.js`** — in the `beforeAll` for any test where an INTERN creates or accesses a task on a PM's project: add a `POST /api/projects/:id/members` call to enroll the INTERN as MEMBER before the task operations.

**`tests/api/tasks.spec.js`** — in `beforeAll` blocks where a user other than the project creator accesses task resources: add membership enrollment for that user.

**`tests/api/sprints.spec.js`** — verify that all sprint tests are run by the PM who created the project (and is thus auto-enrolled as OWNER). If any test uses a different user, enroll them.

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All 105 existing tests + all new membership tests (target: 105 + ~15 = 120+ passing, 0 failing).
**New tests added this phase:** tests/api/members.spec.js — ~15 new test cases.
**Tests expected to be unaffected:** auth.spec.js, clients.spec.js, error-handling.spec.js, projects.spec.js, search-reports-phases.spec.js, users.spec.js

---

### Rollback Instruction

```bash
git checkout apps/backend/tests/api/rbac.spec.js apps/backend/tests/api/tasks.spec.js apps/backend/tests/api/sprints.spec.js
git rm apps/backend/tests/api/members.spec.js
```

---

### Recommended Model

**Recommended:** Pro
**Reason:** Test surgery across 3 existing spec files requires understanding the full state of each test's beforeAll setup and the knock-on effects of the membership guard on every assertion.
