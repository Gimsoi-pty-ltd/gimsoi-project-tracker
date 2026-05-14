# Gimsoi Execution Intelligence — Agent PRD

> Read this before writing any code.
> Do not build anything not listed here.
> The full implementation plan with file-level detail lives in `implementation_plan.md` — this document is the authoritative context layer above it.

---

## What This Feature Set Is

Three backend features that surface smarter task and contributor data to Project Managers. They are built on top of the existing Gimsoi Project Tracker backend without structural changes to the core architecture.

No new models. No new routes (except extending existing endpoints with query params). No LLM calls. No Alert model. No co-assignee logic.

---

## Platform Context

- **Stack:** Node.js + Express + Prisma + PostgreSQL
- **Auth:** JWT (httpOnly cookie) + CSRF double-submit
- **Validation:** Zod schemas, applied as route middleware via `validate(schema, source)`
- **Error handling:** All errors propagate via `next(err)` to global handler
- **Optimistic locking:** All writes require a `version` integer field; 409 on mismatch
- **Test suite:** 117 Playwright tests, must stay at 100% pass rate after each feature

---

## Who Can Use These Features

| Feature | Roles With Access | Gate |
|---|---|---|
| F1 — Urgency Sort (`?sortBy=urgency`) | ADMIN, PM, INTERN, CLIENT (VIEW_TASKS) | Existing auth on `GET /api/tasks` |
| F2 — Health Breakdown (`?breakdown=true`) | ADMIN, PM only | Role check inside service: CLIENT receives `{ percentComplete }` only |
| F3 — Find Help / Skill Match | ADMIN, PM only | `VIEW_ANALYTICS` permission on `GET /api/analytics/team` |
| F3 — Skills profile edit | All authenticated users | `PATCH /api/users/me` — any role |

---

## Feature 1 — Bottleneck Auto-Prioritisation

**Status: Ready. Zero schema changes. No blockers.**

### What changes

`GET /api/tasks` gains an optional `?sortBy=urgency` query param.

### Scoring formula (computed in `task.service.js`, not client-side)

```
priority_weight:  URGENT=4, HIGH=3, MEDIUM=2, LOW=1

days_overdue:
  if dueDate < today AND status NOT IN [DONE, CANCELLED]:
    Math.floor((Date.now() - dueDate) / 86400000)
  else: 0

phase_multiplier (isBlocked takes precedence):
  isBlocked = true  → 2.0
  days_overdue > 0  → 1.5
  else              → 1.0

urgencyScore = priority_weight × (days_overdue + 1) × phase_multiplier
```

The `+1` offset is mandatory. It ensures 0-days-overdue tasks score `× 1`, not `× 0`. Do not remove it.

### Files to touch

| File | Change |
|---|---|
| `schemas/task.schema.js` | Add `sortBy: z.enum(['urgency']).optional()` to `listTasksSchema` |
| `services/task.service.js` | Add `sortBy` param to `getTasksByProject`; compute + append `urgencyScore`; conditionally include `phase`; sort in-memory desc |
| `controllers/task.controller.js` | Pass `sortBy: req.query.sortBy` to service call |

**Routes: no change.** `task.route.js` already applies `validate(listTasksSchema, 'query')` — adding `sortBy` to the schema is sufficient.

### Backward compatibility contract

Without `?sortBy`, response is byte-for-byte identical to today: same sort order, no `urgencyScore`, no `phase` object in each task.

### Test cases

| Input | Expected output |
|---|---|
| BLOCKED + URGENT + 0 days overdue | `urgencyScore = 4 × (0+1) × 2.0 = 8.0` |
| HIGH + 3 days overdue + not blocked | `urgencyScore = 3 × (3+1) × 1.5 = 18.0` |
| LOW + not blocked + 0 days overdue | `urgencyScore = 1 × (0+1) × 1.0 = 1.0` |
| DONE task with past dueDate | `days_overdue = 0` — terminal statuses are excluded |
| `GET /api/tasks?projectId=X` (no sortBy) | Identical to pre-feature response |

---

## Feature 2 — Execution Health Score Drill-Down

**Status: Ready after F1 merges. Zero schema changes.**

### What changes

`GET /api/projects/:id/progress` gains an optional `?breakdown=true` query param.

### Response shape (when `breakdown=true`, non-CLIENT role)

```json
{
  "percentComplete": 64,
  "breakdown": {
    "taskCompletion": {
      "rate": 64,
      "completedTasks": 16,
      "totalTasks": 25,
      "explanation": "Task completion is 64% — 16 of 25 tasks are done."
    },
    "delayRate": {
      "rate": 28,
      "overdueTasks": 7,
      "totalTasks": 25,
      "explanation": "Delay rate is 28% — 7 tasks are currently past their due date."
    },
    "activityLevel": {
      "explanation": "Activity level tracking coming soon."
    }
  }
}
```

### Overdue task query

```sql
COUNT tasks WHERE projectId = :id
  AND dueDate < NOW()
  AND status NOT IN ('DONE', 'CANCELLED')
  AND isDeleted = false
```

### Do not compute

`activityLevel` is a static placeholder string only. Do not query `ActivityLog` for this. Do not show a percentage. The formula is excluded from this MVP because it produces misleading results at current team scale.

### Files to touch

| File | Change |
|---|---|
| `schemas/project.schema.js` | Add `progressQuerySchema = z.object({ breakdown: z.enum(['true','false']).optional() })` |
| `services/project.service.js` | Extend `getProjectProgress` with `{ breakdown = false }` option; run overdue count query; build breakdown object |
| `controllers/project.controller.js` | Pass `breakdown: req.query.breakdown === 'true'` to service |
| `routes/project.route.js` | Add `validate(progressQuerySchema, 'query')` to `GET /:id/progress` route |

### Backward compatibility contract

Without `?breakdown`, response is identical to today. CLIENT role always returns `{ percentComplete }` only, regardless of breakdown param — existing role gate must not be removed.

### Consistency check

`overdueTasks` count must equal the count returned by `GET /api/tasks?projectId=:id&isOverdue=true`. Verify this in tests.

---

## Feature 3 — Contributor Skill Match ("Find Help")

**Status: BLOCKED until PM signs off on 2 decisions. Do not write any F3 code before sign-off.**

### Blocking decisions

| # | Decision | Options | Blocks |
|---|---|---|---|
| 1 | Skills taxonomy | Suggested: `frontend, backend, design, qa, devops, data, product` | Migration |
| 2 | Assign semantics | MVP: replace assigneeId. Post-MVP: co-assignee. | Assign button |

### What changes

`GET /api/analytics/team` gains three optional filter params. `User` model gains a `skills String[]` field. `PATCH /api/users/me` gains a `skills` field.

### New filter params on `GET /api/analytics/team`

| Param | Type | Behaviour |
|---|---|---|
| `phaseSkill` | string (enum value) | Filter users whose `skills[]` contains this value |
| `minRate` | number 0–100 | Post-fetch filter: exclude users with `completionRate < minRate` |
| `availableOnly` | boolean | Exclude users with BLOCKED tasks where `updatedAt >= now - 7 days` |

The 7-day window on `availableOnly` is intentional. Legacy blocked tickets (stale > 7 days) do not indicate current unavailability.

### Skill signal — how `phaseSkill` is determined

`phaseSkill` comes from the **frontend**, not the backend. The frontend reads `task.labels[]`, maps label names case-insensitively against the skills enum, and passes the first match as `phaseSkill`. If no label matches, `phaseSkill` is omitted (no skill filter, show all by availability). The service performs no label translation.

**Do not use `task.phase.name`.** Phase names are free text and will never match the skills enum.

### Availability score formula

```
availabilityScore = (100 - completionRate) × (totalTasks - completedTasks + 1)
```

Appended to each user object in the response. Response sorted by `availabilityScore` desc when any filter param is present.

### Assign confirmation behaviour

- If `task.assigneeId` is null → fire `PATCH` immediately
- If `task.assigneeId` is set → show inline confirmation before firing PATCH:
  `"This will reassign the task from [name] to [name]. The current assignee will no longer be responsible."`
  Buttons: `[Cancel]` `[Confirm Reassign]`
- On error or 409: revert optimistic update, show inline error message

### Known limitation

`minRate` filtering runs post-fetch (completionRate is computed). At ≤14 users this is fine. At 50+ users, page sizes become inconsistent. Document in code comment — do not fix in MVP.

### Launch risk — empty skills on day one

All INTERNs will have `skills = []` after migration. Find Help will return zero results until users self-populate. Required mitigations:
1. Skills profile edit UI must ship before Find Help button is enabled
2. PM must communicate to team before launch
3. Empty state must read: "No contributors have set skills yet. Ask your team to update their profiles." — not a generic empty state
4. Find Help button must be behind a feature flag or PM toggle until ≥50% of active members have skills set

### Migration rollback (if needed)

Do not run `prisma migrate reset` on production — it drops all data.

Safe rollback: create a new migration with `ALTER TABLE "User" DROP COLUMN IF EXISTS "skills"` and mark original as rolled back in `_prisma_migrations`. On development, `prisma migrate reset` is safe.

### Files to touch

| File | Change |
|---|---|
| `prisma/schema.prisma` | Add `skills String[] @default([])` to User model |
| `schemas/analytics.schema.js` | Add `phaseSkill`, `minRate`, `availableOnly` to `teamAnalyticsSchema` |
| `services/analytics.service.js` | Add filters, availabilityScore, sort to `getTeamPerformance` |
| `controllers/analytics.controller.js` | Pass filter params; add role-gate comment block |
| `schemas/user.schema.js` | Add `skills` to `updateProfileSchema` (Zod enum, max 5) |

**Routes: no change.** Both `analytics.route.js` and `user.route.js` already apply the relevant validation middleware.

---

## What Is Deferred — Do Not Touch

| Item | Reason |
|---|---|
| Alert model + "Act Now" | No alert generation mechanism exists. UI without content is worse than nothing. |
| Co-assignee (`coAssignees[]`) | Requires schema migration + separate UI. Out of MVP scope. |
| Contributor sparkline (7-day) | At current team scale, produces `[0,0,0,0,0,1,0]` — noise not signal. |
| Activity Level sub-score | `activeUsers / totalMembers` over 30 days returns 90–100% on active projects. Misleads PMs. |

---

## Execution Order

```
1. Pre-flight: add role-gate comment to analytics.controller.js
2. F1: task.schema.js → task.service.js → task.controller.js → tests pass
3. F2: project.schema.js → project.service.js → project.controller.js → project.route.js → tests pass
4. PM sign-off: skills taxonomy + assign semantics
5. F3: schema.prisma → migrate → seed → analytics.schema.js → analytics.service.js → analytics.controller.js → user.schema.js → tests pass
```
