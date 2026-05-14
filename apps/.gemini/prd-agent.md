# Gimsoi Project Tracker — Agent PRD

> Read this in full before generating any code or plans.
> Do not build anything not listed here.
> Do not infer scope. If it is not here, it does not exist yet.

---

## What This System Is

A **software project management tool** used internally by Gimsoi teams (ADMIN, PM, INTERN) and externally by clients (CLIENT role — read-only). It is not a SaaS product. It is an internal delivery engine with a client-facing transparency layer bolted on.

The backend is Node.js + Express + Prisma + PostgreSQL. The frontend is to be determined per sprint. Auth uses JWT + httpOnly cookies. CSRF protection is enforced on all mutating endpoints.

---

## Core Models (Already Built)

| Model | Key Fields |
|---|---|
| `User` | id, email, fullName, role(ADMIN\|PM\|INTERN\|CLIENT), skills[], version |
| `Project` | id, name, status(DRAFT\|ACTIVE\|COMPLETED\|ARCHIVED), clientId, version |
| `Sprint` | id, name, status(PLANNING\|ACTIVE\|CLOSED), projectId, version |
| `Task` | id, title, status(TODO\|IN_PROGRESS\|DONE\|CANCELLED\|BLOCKED), priority, dueDate, isBlocked, assigneeId, phaseId, version |
| `Phase` | id, name, status(DRAFT\|ACTIVE\|COMPLETED), order, projectId |
| `ProjectMember` | projectId, userId, role(OWNER\|MEMBER\|VIEWER) |
| `ActivityLog` | taskId, userId, action, oldValue, newValue, createdAt |
| `ProjectAnalytics` | projectId, totalTasks, completedTasks, blockedTasks, cancelledTasks |
| `Label` | id, name, color, projectId |
| `Comment` | id, content, taskId, userId |
| `Report` | id, name, type, fileUrl, projectId |

---

## RBAC — Permissions Matrix

| Permission | ADMIN | PM | INTERN | CLIENT |
|---|---|---|---|---|
| VIEW_ANALYTICS | ✅ | ✅ | ❌ | ❌ |
| MANAGE_PROJECTS | ✅ | ✅ | ❌ | ❌ |
| UPDATE_ANY_TASK | ✅ | ✅ | ❌ | ❌ |
| UPDATE_TASK | ✅ | ✅ | ✅ (own only) | ❌ |
| VIEW_TASKS | ✅ | ✅ | ✅ | ✅ |
| VIEW_PROJECTS | ✅ | ✅ | ✅ | ✅ |
| MANAGE_USERS | ✅ | ❌ | ❌ | ❌ |

---

## Existing API Surface (Do Not Duplicate)

```
Auth:    POST /signup /login /logout /verify-email /forgot-password /reset-password/:token
         GET  /check-auth

Tasks:   GET  /api/tasks?projectId&status&isBlocked&isOverdue&sortBy&limit&cursor
         GET  /api/tasks/:id
         GET  /api/tasks/projects/:projectId/summary
         POST /api/tasks
         PATCH /api/tasks/:id          (requires version)
         DELETE /api/tasks/:id
         GET/POST /api/tasks/:id/comments
         DELETE /api/tasks/comments/:id
         GET  /api/tasks/:id/activities
         POST /api/tasks/:id/labels

Projects: GET/POST /api/projects
          GET/PATCH/DELETE /api/projects/:id
          GET  /api/projects/:id/progress?breakdown=true
          POST /api/projects/:id/analytics
          GET/POST /api/projects/:id/members
          PATCH/DELETE /api/projects/:id/members/:userId
          GET/POST /api/projects/:projectId/labels
          PATCH/DELETE /api/projects/labels/:id
          PATCH /api/projects/:projectId/tasks/bulk
          DELETE /api/projects/:projectId/tasks/bulk

Sprints:  GET /api/sprints?projectId=
          GET /api/sprints/:id/velocity
          POST /api/sprints
          PATCH /api/sprints/:id/status
          PATCH /api/sprints/:id

Phases:   GET /api/phases?projectId=
          GET /api/phases/:id
          GET /api/phases/:id/milestone
          POST/PATCH/DELETE /api/phases/:id

Clients:  GET/POST /api/clients
          GET/PATCH/DELETE /api/clients/:id

Users:    GET /api/users
          POST /api/users
          PATCH /api/users/:id/role
          PATCH /api/users/me
          POST /api/users/me/avatar

Analytics: GET /api/analytics/team?phaseSkill&minRate&availableOnly&limit&cursor

Search:   GET /api/search?q&type

Reports:  POST /api/reports
          GET  /api/reports/:id/pdf
```

---

## Active Build: Execution Intelligence MVP

Three features in strict order. Do not start a feature until the previous one is merged and tested.

### Feature 1 — Bottleneck Auto-Prioritisation
**Status: Ready to build. Zero schema changes.**

Adds `?sortBy=urgency` to `GET /api/tasks`. When passed:
- Compute `urgencyScore = priority_weight × (days_overdue + 1) × phase_multiplier` for each task
- `priority_weight`: URGENT=4, HIGH=3, MEDIUM=2, LOW=1
- `days_overdue`: `Math.floor((Date.now() - dueDate) / 86400000)` if dueDate < today and status not in [DONE, CANCELLED], else 0
- `phase_multiplier`: isBlocked=true → 2.0; days_overdue > 0 → 1.5; else → 1.0 (isBlocked takes precedence)
- Include `phase: { id, status }` in task response only when `sortBy=urgency`
- Return tasks sorted by `urgencyScore` desc, with `urgencyScore` appended to each object
- Without `sortBy`, response is identical to today

Files: `schemas/task.schema.js`, `services/task.service.js`, `controllers/task.controller.js`

### Feature 2 — Health Score Drill-Down
**Status: Ready to build after F1. Zero schema changes.**

Extends `GET /api/projects/:id/progress` with `?breakdown=true`. When passed (non-CLIENT role):
- Returns `breakdown.taskCompletion`, `breakdown.delayRate`, `breakdown.activityLevel`
- `delayRate.overdueTasks` = `count(tasks WHERE dueDate < now AND status NOT IN [DONE,CANCELLED] AND isDeleted=false)`
- `activityLevel.explanation` = static string `"Activity level tracking coming soon."` — do not compute
- Template strings for explanations — no LLM
- Without param, response is identical to today. CLIENT always receives `{ percentComplete }` only.

Files: `schemas/project.schema.js`, `services/project.service.js`, `controllers/project.controller.js`, `routes/project.route.js`

### Feature 3 — Contributor Skill Match ("Find Help")
**Status: BLOCKED. PM sign-off required on 2 decisions before writing any code.**

**Blocking Decision 1:** Skills taxonomy — confirm values before migration. Suggested: `["frontend","backend","design","qa","devops","data","product"]`

**Blocking Decision 2:** Assign semantics — `PATCH /api/tasks/:id` replaces `assigneeId`. No co-assignee in MVP.

After sign-off:
- Add `skills String[] @default([])` to `User` in Prisma schema
- Run `npx prisma migrate dev --name add_user_skills`
- Seed: ADMIN → [], PM → ["product"], INTERN → [], CLIENT → []
- Extend `GET /api/analytics/team` with `?phaseSkill=`, `?minRate=`, `?availableOnly=true`
- `availableOnly` excludes users with BLOCKED tasks where `updatedAt >= now - 7 days` (7-day window, not all-time)
- `minRate` filters post-fetch (computed field) — document pagination limitation in code comment
- `phaseSkill` maps from `task.labels[]` name → skills enum (client-side lookup). Service receives clean enum value or undefined.
- `availabilityScore = (100 - completionRate) × (totalTasks - completedTasks + 1)`, sorted desc
- Add `skills` to `updateProfileSchema` (Zod enum, max 5)
- Assign button: if task already has assignee, show confirmation before firing PATCH
- Do NOT enable Find Help button until ≥50% of active project members have skills set

Files: `prisma/schema.prisma`, `schemas/analytics.schema.js`, `services/analytics.service.js`, `controllers/analytics.controller.js`, `schemas/user.schema.js`

---

## Hard Rules for All Features

1. No LLM calls. All scoring, ranking, and explanations are deterministic formulas or template strings.
2. No new endpoints unless explicitly listed. Extend existing endpoints with query params.
3. All new query params are backward-compatible. Existing callers without new params receive identical responses.
4. All writes use optimistic locking (`version` field). 409 on mismatch.
5. Do not touch the Alert model. It is deferred — do not scaffold, stub, or reference it.
6. `GET /api/analytics/team` requires `VIEW_ANALYTICS` — ADMIN and PM only. Check before rendering any UI.

---

## Deferred (Do Not Build Now)

- Alert model and "Act Now" button (no alert generation mechanism exists)
- Co-assignee support (requires schema change + separate UI)
- Contributor sparkline (insufficient data density at current team scale)
- Activity Level sub-score computation (formula produces misleading results at current scale)
