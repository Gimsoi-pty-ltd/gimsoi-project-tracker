# Execution Intelligence — Sprint 1 & 2 Build Guide
## Using the .gemini Feature Cycle Workflow

> **Read this before starting.** Sprints 1 and 2 have no schema changes and no blockers.
> Sprint 3 is gated — do not start it until two PM decisions are confirmed.
> This guide tells you exactly which workflow to trigger, in what order, and what to do when something goes wrong.

---

## Before You Start Anything

Run this. If it fails, stop here and fix the baseline first.

```bash
npm run test:api
```

Expected: **117 tests passed**. If any test fails, do not start the feature cycle. Fix the baseline, then come back.

Once clean, record it:
```
BASELINE: 117 tests passed — <date>
```

---

## Sprint 1 — Urgency Sort

### What you're building
An optional `?sortBy=urgency` query param on the task list API. Tasks come back sorted by urgency score. Default behaviour is unchanged.

### Files you will touch
| File | What changes |
|---|---|
| `apps/backend/schemas/task.schema.js` | Add `sortBy: z.enum(['urgency']).optional()` to `listTasksSchema` |
| `apps/backend/services/task.service.js` | Add urgency score compute + sort + conditional phase include |
| `apps/backend/controllers/task.controller.js` | Pass `sortBy` from `req.query` to service |

**No other files.** If you need to touch anything else, stop and escalate.

---

### Trigger the feature cycle

Type this to start:
```
/feature urgency-sort — add ?sortBy=urgency to GET /api/tasks
```

The workflow in `workflows/feature-cycle.md` will run 8 steps. Here is what to do at each one:

---

### Step 1 — PRD Generation

The workflow will generate a PRD and save it to:
```
apps/.gemini/history/urgency-sort/prd-urgency-sort.md
```

**Check:** Does the PRD match what's in `prd-exec-intelligence-agent.md` under Feature 1?
- Scoring formula: `priority_weight × (days_overdue + 1) × phase_multiplier`
- The `+1` offset must be explicit — a task due today scores `× 1`, not `× 0`
- Default sort must be unchanged when `sortBy` is not passed

If yes: type **"Acknowledged"** to continue.
If the PRD is missing anything: correct it before proceeding. The PRD drives everything downstream.

---

### Step 2 — Fit Analysis

The workflow scans the codebase and scores the feature's impact.

**Expected result:** Small (S) or Medium (M). This feature touches 3 files in 3 layers (schema, service, controller) but all changes are additive. No new dependencies. No middleware changes.

If the fit analysis flags anything unexpected, read it carefully before continuing.

---

### Step 3 — Complexity Classification

**Expected classification: M (Medium)** — 3 files, 3 layers, but all changes are extension-only.

If the classifier returns **L (Large)**, the workflow will prompt:
```
⚡ MODEL SWITCH RECOMMENDED — switch to Pro for phase planning
```
Switch to Pro in Antigravity, then type **"Pro ready"**.

For M or S, proceed immediately.

---

### Step 4 — Phase Planning

The phase plan must produce exactly **3 phases** for Sprint 1:

```
Phase 1 — Schema: add sortBy to listTasksSchema
  File: schemas/task.schema.js
  Gate: npm run test:api passes (no new tests needed — backward compat check)

Phase 2 — Service: compute urgencyScore, sort, conditional phase include
  File: services/task.service.js
  Gate: npm run test:api passes

Phase 3 — Controller: pass sortBy to service
  File: controllers/task.controller.js
  Gate: npm run test:api passes
```

If the planner merges phases or proposes different files, correct it — each layer must be its own phase.

After the phase plan is displayed, the workflow prompts a model switch back to Flash. Switch back, then type **"Flash ready"**.

---

### Step 5 — Phase Execution

The workflow runs each phase using `workflows/phase-runner.md`.

**Phase 1 execution notes:**
- Add `sortBy: z.enum(['urgency']).optional()` to the existing `listTasksSchema` object in `task.schema.js`
- Do not create a new schema — extend the existing one
- Run `npm run test:api` — expect 117 pass (schema change is additive, no existing caller is affected)

**Phase 2 execution notes:**
- Target function: `getTasksByProject` (line 173 in `task.service.js`)
- The Prisma `findMany` result is sorted **after** the DB fetch — not in the Prisma `orderBy` clause. This is correct. Urgency score depends on `Date.now()` which cannot go into Prisma `orderBy`.
- When `sortBy === 'urgency'`: add `phase: { select: { id: true, status: true } }` to the `include` block
- When `sortBy` is not provided: include block is **identical to today** — no phase object
- Append `urgencyScore` to each task object only when `sortBy === 'urgency'`
- Run `npm run test:api` — expect 117 pass

**Phase 3 execution notes:**
- Target function: `getTasks` (line 24 in `task.controller.js`)
- Add `sortBy` to the destructure from `req.query`, then pass it to the service call
- `req.query` is already validated by `listTasksSchema` middleware — `sortBy` is guaranteed to be `'urgency'` or `undefined`
- Run `npm run test:api` — expect 117 pass

**If any phase fails:**

| Condition | Action |
|---|---|
| Fix is in 1 file, same layer (SIMPLE) | Fix inline, re-run immediately |
| Fix crosses files or layers (COMPLEX) | STOP — activate `workflows/fix-escalation.md`, wait for "Approved" |
| DB timeout error | Re-run `npm run test:api` once with no code changes |

---

### Step 6 — Code Review

The workflow activates the Code Reviewer persona (`AGENTS.md`).

**What to look for in the review output:**

| Issue | What it means |
|---|---|
| `isBlocked` multiplier applied AND `days_overdue` multiplier also applied | Bug — `isBlocked` must take precedence, not both multiply |
| `urgencyScore` appears in non-urgency responses | Bug — score must only appear when `sortBy=urgency` |
| Phase included in non-urgency responses | Bug — include must be conditional |
| Raw SQL in service | Hard block per `GUARDRAILS.md` — do not allow |

CRITICALs must be fixed before Step 7. WARNINGs must be reviewed. SUGGESTIONs are optional.

---

### Step 7 — Achievability Check

Maps each PRD requirement to a code change. The check must confirm:

- [ ] `GET /api/tasks?sortBy=urgency` returns tasks sorted by `urgencyScore` desc ✓
- [ ] Each task object includes `urgencyScore` field ✓
- [ ] Phase object included per task when `sortBy=urgency` ✓
- [ ] Without `sortBy`, response is identical to pre-feature ✓
- [ ] `isBlocked` takes precedence over `days_overdue` in multiplier ✓
- [ ] Terminal statuses (DONE, CANCELLED) excluded from `days_overdue` calc ✓

If any requirement is **UNMET**, do not proceed to Step 8. Fix the gap first.

---

### Steps 8, 8.5, 8.6 — Reports and Git Plan

The workflow generates:
- Final report → `apps/.gemini/history/urgency-sort/final-report-urgency-sort.md`
- Changes made doc → `apps/.gemini/history/urgency-sort/changes-made-urgency-sort.md`
- Git commit plan → copy-paste commands (do not run `git push` — hand this to the user)

---

### Sprint 1 is done when:
- [ ] 117 tests still pass
- [ ] `GET /api/tasks?sortBy=urgency` returns scores correctly
- [ ] `GET /api/tasks?projectId=X` (no sortBy) is identical to before
- [ ] All artifacts saved to `apps/.gemini/history/urgency-sort/`
- [ ] No `git push` has been run

---

## Sprint 2 — Health Score Drill-Down

**Start only after Sprint 1 is merged and the baseline is still 117/117.**

Re-confirm baseline before starting Sprint 2:
```bash
npm run test:api
```
Expected: 117 passed. If not, stop.

---

### What you're building
An optional `?breakdown=true` param on the project progress endpoint. Returns two sub-scores with plain-English explanations. Default response is unchanged.

### Files you will touch
| File | What changes |
|---|---|
| `apps/backend/schemas/project.schema.js` | Add `progressQuerySchema` |
| `apps/backend/services/project.service.js` | Extend `getProjectProgress` with `breakdown` option |
| `apps/backend/controllers/project.controller.js` | Pass `breakdown` flag to service |
| `apps/backend/routes/project.route.js` | Add `validate(progressQuerySchema, 'query')` to progress route |

**No other files.** If you need to touch anything else, stop and escalate.

---

### Trigger the feature cycle

```
/feature health-breakdown — add ?breakdown=true to GET /api/projects/:id/progress
```

---

### Key rules for the PRD (Step 1)

When reviewing the generated PRD, confirm it includes:

- `breakdown.activityLevel` returns a **static string only**: `"Activity level tracking coming soon."` — no query, no percentage, no computation
- CLIENT role always returns `{ percentComplete }` only, even when `?breakdown=true` is passed — the existing role gate must not be removed
- `overdueTasks` count must match what `GET /api/tasks?projectId=:id&isOverdue=true` returns — this is the consistency contract
- No LLM calls — explanation strings are template literals only

---

### Phase plan (Step 4)

Must produce **4 phases**:

```
Phase 1 — Schema: add progressQuerySchema to project.schema.js
  File: schemas/project.schema.js
  Gate: npm run test:api (117 pass)

Phase 2 — Service: extend getProjectProgress with breakdown option
  File: services/project.service.js
  Gate: npm run test:api (117 pass)

Phase 3 — Controller: pass breakdown flag to service
  File: controllers/project.controller.js
  Gate: npm run test:api (117 pass)

Phase 4 — Route: add validate(progressQuerySchema, 'query') to progress route
  File: routes/project.route.js
  Gate: npm run test:api (117 pass)
```

---

### Phase 2 execution notes (service)

Target function: `getProjectProgress(projectId, userRole)` — extend signature to `getProjectProgress(projectId, userRole, { breakdown = false } = {})`.

When `breakdown` is true AND `userRole !== 'CLIENT'`:

1. `completedTasks` and `totalTasks` already exist from the existing `getProjectTaskSummary` call — reuse them
2. Run **one** new Prisma query for `overdueTasks`:
   ```js
   prisma.task.count({
     where: {
       projectId,
       dueDate: { lt: new Date() },
       status: { notIn: ['DONE', 'CANCELLED'] },
       isDeleted: false
     }
   })
   ```
3. Build explanation strings with template literals — no LLM
4. Do not query `ActivityLog` — activity level is a static string only

When `breakdown` is false OR `userRole === 'CLIENT'`: return existing response unchanged.

**Division guard:** if `totalTasks === 0`, return `rate: 0` for both sub-scores. Never divide by zero.

---

### Phase 4 execution note (route)

The `progressQuerySchema` must be imported from `project.schema.js` and applied as:
```
validate(progressQuerySchema, 'query')
```
This goes **before** the handler in the middleware chain on the `GET /:id/progress` route. It is not a body validator — `'query'` is the correct second argument.

---

### Achievability check (Step 7)

Must confirm:
- [ ] `?breakdown=true` returns full sub-score shape with computed values ✓
- [ ] Without `?breakdown`, response identical to today ✓
- [ ] CLIENT role returns only `{ percentComplete }` regardless of param ✓
- [ ] `overdueTasks` count matches `GET /api/tasks?projectId=:id&isOverdue=true` ✓
- [ ] Explanation strings contain real numbers, not placeholder text ✓
- [ ] Division by zero handled when `totalTasks === 0` ✓
- [ ] `activityLevel` has explanation string only — no rate, no query ✓

---

### Sprint 2 is done when:
- [ ] 117 tests still pass
- [ ] `GET /api/projects/:id/progress?breakdown=true` returns correct shape
- [ ] `GET /api/projects/:id/progress` (no param) is identical to before
- [ ] CLIENT role still gets only `{ percentComplete }` with or without breakdown param
- [ ] All artifacts saved to `apps/.gemini/history/health-breakdown/`
- [ ] No `git push` has been run

---

## Sprint 3 Gate — Do Not Pass Until These Are Confirmed

Sprint 3 (`/feature contributor-skill-match`) **cannot start** until a human PM has confirmed both of these in writing:

| Decision | Status |
|---|---|
| **Skills taxonomy** — exact list of allowed values for `skills[]` | ⏳ Waiting for PM |
| **Assign semantics** — replacing assigneeId (not co-assign) is acceptable for MVP | ⏳ Waiting for PM |

When both are confirmed, the Sprint 3 feature cycle starts with:
```
/feature contributor-skill-match — add skills[] to User, filter GET /api/analytics/team
```

Note: Sprint 3 requires a Prisma schema change (`skills String[]` on User). Per `GUARDRAILS.md`, any modification to `schema.prisma` requires explicit user confirmation before the migration runs. The workflow will surface the confirmation prompt — do not skip it.

---

## Quick Reference — Workflow Files

| File | Purpose |
|---|---|
| `workflows/feature-cycle.md` | The 8-step orchestrator — triggers with `/feature <description>` |
| `workflows/phase-runner.md` | Runs a single phase — triggers with `/run-phase <N>` |
| `workflows/fix-escalation.md` | Handles COMPLEX failures — triggers automatically on cross-layer failures |
| `AGENTS.md` | Persona constraints — what each agent can and cannot do |
| `GUARDRAILS.md` | Hard stops — actions that require explicit confirmation |
| `GEMINI.md` | Code standards — ESM only, no silent failures, no hardcoded secrets |
