# Client-Readiness Remediation Plan
### Gimsoi Project Tracker — How to Fix the Audit Using `.gemini`

> **Source:** `client_readiness_audit.md` — 36/80 use cases passing as of 2026-04-29.
> **Goal:** Reach client-readiness (all blockers cleared, major partials resolved).
> **Method:** Run each wave as a separate `/feature` invocation through `feature-cycle.md`.

---

## Before You Start Any Wave

Every time you begin a new session, run the baseline check first:

```powershell
cd apps/backend
npm run test:api
```

The output must show **105 passed, 0 failed** before you trigger `/feature`.
If it does not, fix the baseline before proceeding — the workflow will refuse to start on a broken baseline.

Also confirm you are on the correct branch:
```powershell
git status
git branch
```

---

## The Golden Rule

> **One `/feature` invocation = one thing a PM can describe in one sentence.**

Never paste the whole audit. Never combine schema migrations with feature logic in one feature invocation. The phase planner cannot safely execute cross-cutting changes in one pass.

---

## Wave 1 — Project Membership (BLOCKERS #37, #38, #39, #40, #41)

**Why first:** Everything in Wave 2 and Wave 3 depends on knowing who belongs to a project. The current system only stores `createdByUserId` — any authenticated user can read any project's tasks. This is a data-isolation failure.

**This wave requires a schema migration.** It must land and pass tests before any other wave starts.

### How to trigger

Paste this as your `/feature` input:

```
/feature project membership model and API

Implement a ProjectMember join table so users can be added to projects with a role.
The current schema only has createdByUserId on Project — there is no membership model.

Requirements:
- Add a ProjectMember model to schema.prisma with fields: id, projectId, userId, role (enum: OWNER, MEMBER, VIEWER), createdAt
- POST /api/projects/:id/members — add a user to a project (Admin/PM only)
- DELETE /api/projects/:id/members/:userId — remove a member (Admin/PM only)
- GET /api/projects/:id/members — list members with userId, fullName, role (all authenticated)
- PATCH /api/projects/:id/members/:userId — update a member's role (Admin/PM only)
- Enforce that only project members can access project-scoped resources (tasks, phases, sprints). Retrofit assertOwnership or add a new assertMembership helper.
- Prevent duplicate membership (P2002 handled)

Audit ref: Use cases #37, #38, #39, #40, #41
```

### What the workflow will do
- `prd-generator.md` — produce a PRD
- `fit-analysis.md` — find schema.prisma, ownership.js, task.service.js, phase.service.js as affected
- `phase-planner.md` — **must isolate the schema change into Phase 1 alone** (the skill enforces this)
- `prisma-workflow.md` — governs the migration phase
- Each subsequent phase adds the service, controller, route, and tests

### When this wave is done
- `GET /api/projects/:id/members` returns data
- `POST /api/tasks?projectId=<id>` returns 403 for users not in the project
- All 105+ tests still pass

---

## Wave 2 — Comments (BLOCKER #44–#47)

**Why second:** The `Comment` model already exists in `schema.prisma` with correct relations. This is the cheapest blocker to clear — no migration needed.

**Prerequisite:** Wave 1 must be merged and tests passing.

### How to trigger

```
/feature comment system for tasks

The Comment model already exists in schema.prisma (taskId FK, userId FK, cascade delete).
There is no service, controller, or route — implement the full comment API.

Requirements:
- POST /api/tasks/:id/comments — add comment to task (authenticated, any role with VIEW_TASKS)
- GET /api/tasks/:id/comments — list comments paginated, ordered by createdAt ASC, include author fullName and avatarUrl
- PATCH /api/comments/:id — edit own comment only (author check: comment.userId === req.user.id)
- DELETE /api/comments/:id — delete own comment or Admin can delete any
- getTaskById must include _count: { select: { comments: true } } in its Prisma query

Audit ref: Use cases #44, #45, #46, #47, #48
```

---

## Wave 3 — Task List Filtering Gaps (FAILs #4, #5, #15, #16, #17, #18, #19)

**Why third:** No schema changes. All S-effort service-layer additions. Unblocks the task board UI completely.

**Prerequisite:** Wave 1 merged.

### How to trigger

```
/feature task and project list advanced filtering

Add missing filter and sort parameters to existing list endpoints. No schema changes required.

Project list gaps (project.service.js getProjects):
- Add status filter: ?status=ACTIVE|DRAFT|COMPLETED — applied in Prisma where clause
- Add createdByUserId filter: ?ownerId=<uuid> — applied in Prisma where clause

Task list gaps (task.service.js getTasksByProject):
- Add assigneeId filter: ?assigneeId=<uuid> — applied in where clause
- Add priority filter: ?priority=LOW|MEDIUM|HIGH|URGENT — applied in where clause
- Add dueDateFrom / dueDateTo filters: date range applied as gte/lte on dueDate
- Add search: ?q=<string> — contains on title field, case insensitive
- Add orderBy: ?orderBy=dueDate|priority|createdAt|status and ?order=asc|desc

All filters must be applied at the Prisma query level — not in-memory after fetch.

Audit ref: Use cases #4, #5, #15, #16, #17, #18, #19, partial #52, #53
```

---

## Wave 4 — Reporting & Dashboard Query Gaps (FAILs #50, #53, #56)

**Why fourth:** No schema changes. Adds aggregate query endpoints for the dashboard.

**Prerequisite:** Wave 3 merged (filtering is a dependency for overdue logic).

### How to trigger

```
/feature dashboard aggregate query endpoints

Add three missing aggregate/query endpoints for the reporting dashboard. No schema changes.

Requirements:
- GET /api/tasks/overdue/count?projectId=<id> — returns { count: N } where dueDate < now AND status != DONE. DB-level aggregate using Prisma count.
- GET /api/tasks?dueDateFrom=<iso>&dueDateTo=<iso> — already partially covered by wave 3; ensure count variant also works.
- GET /api/projects/overdue — returns projects that have at least one task where dueDate < now AND status != DONE. Use Prisma some filter: where: { tasks: { some: { dueDate: { lt: new Date() }, status: { not: 'DONE' } } } }
- Add optional projectId param to GET /api/analytics/team so team workload can be scoped to a single project.

Audit ref: Use cases #50, #53, #54 (partial), #56
```

---

## Wave 5 — Labels (BLOCKER #59–#64)

**Why fifth:** Requires a schema migration. Must be isolated.

**Prerequisite:** All previous waves merged and tests passing.

### How to trigger

```
/feature label and task categorization

Add a Label model to the schema and implement the full label API.
Labels are scoped to a project and can be assigned to tasks (many-to-many).

Schema changes required:
- Add Label model: id, name, color (String?), projectId FK (cascade delete)
- Add implicit many-to-many relation between Task and Label (_TaskLabel)
- Add @@unique([projectId, name]) on Label

API requirements:
- POST /api/projects/:id/labels — create label (name unique per project enforced)
- GET /api/projects/:id/labels — list all labels for a project
- POST /api/tasks/:id/labels — assign a label to a task (label must belong to same project as task)
- DELETE /api/tasks/:id/labels/:labelId — remove label from task (disconnect, do not delete label)
- DELETE /api/projects/:id/labels/:labelId — delete a label (disconnects from all tasks, does not delete tasks)
- GET /api/tasks?labelId=<uuid> — filter tasks by label using Prisma: where: { labels: { some: { id: labelId } } }

Audit ref: Use cases #59, #60, #61, #62, #63, #64
```

---

## Wave 6 — Milestones (BLOCKER #65–#70)

**Why sixth:** Requires a schema migration. Must be isolated.

**Prerequisite:** All previous waves merged and tests passing.

### How to trigger

```
/feature milestone tracking

Add a Milestone model to the schema and implement the milestone API.
Milestones belong to a project and tasks can be optionally associated with a milestone.

Schema changes required:
- Add Milestone model: id, name, description?, targetDate (DateTime?), status (enum: OPEN, COMPLETED), completedAt (DateTime?), projectId FK (cascade delete), createdAt, updatedAt, version
- Add milestoneId FK (optional, SetNull on delete) to Task model

API requirements:
- POST /api/projects/:id/milestones — create milestone linked to project
- GET /api/projects/:id/milestones — list milestones with _count of total and completed tasks
- PATCH /api/tasks/:id — already supports PATCH; ensure milestoneId is accepted (add to updateTaskSchema)
- GET /api/milestones/:id/progress — returns { total: N, completed: N, percentComplete: N } via Prisma groupBy
- PATCH /api/milestones/:id/status — set to COMPLETED, auto-set completedAt
- GET /api/tasks?milestoneId=<uuid> — filter tasks by milestone (add to wave 3 filtering if not already done)

Audit ref: Use cases #65, #66, #67, #68, #69, #70
```

---

## Wave 7 — Bulk Task Operations (FAILs #29, #30)

**Why last:** No schema changes. Requires membership (Wave 1) and filtering (Wave 3) to be solid first so bulk operations can be properly scoped and authorized.

### How to trigger

```
/feature bulk task operations

Add bulk update endpoints for task status and assignment. No schema changes required.

Requirements:
- PATCH /api/tasks/bulk/status — body: { taskIds: [uuid], status: TaskStatus, version: number }. Uses Prisma updateMany scoped to a single projectId (inferred from first task or required as body param). All tasks must belong to same project — validate before write. Returns count of updated records.
- PATCH /api/tasks/bulk/assign — body: { taskIds: [uuid], assigneeId: uuid | null }. Validates assignee is a member of the project. Uses updateMany — not N individual writes.
- Both endpoints require Admin or PM role.
- Both endpoints return { success: true, updatedCount: N }.

Audit ref: Use cases #29, #30
```

---

## Tracking Progress

After each wave completes, update the score below:

| Wave | Feature | Status | Audit Use Cases | Tests After |
|------|---------|--------|----------------|-------------|
| 1 | Project Membership | ⬜ Not started | #37–41 | 105 baseline |
| 2 | Comments | ⬜ Not started | #44–48 | — |
| 3 | Task/Project Filtering | ⬜ Not started | #4, #5, #15–19 | — |
| 4 | Dashboard Aggregates | ⬜ Not started | #50, #53, #54, #56 | — |
| 5 | Labels | ⬜ Not started | #59–64 | — |
| 6 | Milestones | ⬜ Not started | #65–70 | — |
| 7 | Bulk Operations | ⬜ Not started | #29, #30 | — |

---

## Remaining Partials to Clean Up (Do Alongside Waves)

These are small fixes that can be added to any wave's PR without a new feature cycle:

| Partial | Fix | Add to Wave |
|---------|-----|------------|
| #2 — getProjectById missing member count | Add `_count: { select: { tasks: true, sprints: true } }` to `project.service.js:47` | Wave 1 |
| #21/#22 — assignee not validated as project member | After Wave 1, add membership check in `task.service.js` before writing `assigneeId` | Wave 1 |
| #48 — task detail missing comment count | Add `_count: { select: { comments: true } }` to `task.service.js:176` | Wave 2 |
| #77 — Zod errors only return first message | Change `err.errors?.[0]?.message` to return full array in `server.js:110` | Any wave |
| #56 — delete phase returns 200 not 204 | Change `phase.controller.js:56` to `res.status(204).send()` | Any wave |
