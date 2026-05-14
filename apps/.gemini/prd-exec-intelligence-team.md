# Gimsoi Execution Intelligence — 3-Sprint Plan

**Goal: Give PMs smarter tools to spot problems and fix them faster.**
**Timeline: 3 sprints. Each sprint = 2 weeks.**

---

## The Problem We're Solving

PMs can't triage at a glance. Urgent tasks look the same as low-priority ones. Health scores are black boxes. Finding someone to help with a stuck task takes too long.

These three sprints fix that — without building new screens, new databases, or anything users need to learn from scratch.

---

## Sprint 1 — Urgency Sort
**Ship first. No blockers. Starts immediately.**

### What it does
Tasks that need attention move to the top automatically. PMs toggle it on. Default view stays unchanged for everyone else.

### How the score works
```
Score = priority × (days overdue + 1) × multiplier
  Priority:   URGENT=4, HIGH=3, MEDIUM=2, LOW=1
  Multiplier: Blocked task → 2.0 | Overdue → 1.5 | Normal → 1.0
```
Blocked tasks always use the 2.0 multiplier, even if they're also overdue.

### Visual tiers on task cards
| Score | Colour | Meaning |
|---|---|---|
| Above 6.0 | 🔴 Red left border | Critical — act now |
| 3.0 – 6.0 | 🟡 Amber left border | At risk — watch closely |
| Below 3.0 | No border | On track |

### What each team does

| Team | Task |
|---|---|
| **Backend** | Add `?sortBy=urgency` to the task list API. Compute score per task. Sort before returning. Add score to each task object. Default response stays identical without this param. |
| **Frontend** | Add a "Sort by urgency / Default" toggle to the task list header. Apply coloured left borders based on score from API. Do NOT recompute the score on the client. |
| **QA** | Confirm sorted order matches expected scores. Confirm no `sortBy` → response identical to today. |
| **Product** | Approve scoring formula and visual tiers before dev starts. |

### Done when
- [ ] `GET /api/tasks?sortBy=urgency` returns tasks sorted by score with score field included
- [ ] Default `GET /api/tasks` is byte-for-byte identical to pre-feature
- [ ] Toggle works in UI. Borders render correctly per tier.
- [ ] No console errors

---

## Sprint 2 — Health Score Drill-Down
**Starts after Sprint 1 is merged and tested.**

### What it does
The project health percentage becomes clickable. PMs see two plain-English sub-scores explaining exactly what's dragging the number down — and can jump straight to the filtered task list to fix it.

### What PMs see when they click
```
Task Completion  64%   "16 of 25 tasks are done."          → [View tasks]
Delay Rate       28%   "7 tasks are past their due date."  → [View overdue tasks]
Activity Level         "Coming soon."
```

Clients still only see the overall percentage. Nothing changes for them.

### What each team does

| Team | Task |
|---|---|
| **Backend** | Add `?breakdown=true` to the project progress API. Run one extra DB query to count overdue tasks. Build the sub-score object with template string explanations. No LLM — plain strings only. |
| **Frontend** | Make the health score widget clickable. Expand an inline panel below it (no modal). Show two sub-score rows with explanation text and a deep-link each. Collapse on second click. |
| **QA** | Confirm overdue task count matches `GET /api/tasks?isOverdue=true` count. Confirm clients still get only `{ percentComplete }`. Confirm no `breakdown` → response identical to today. |
| **Product** | Approve the explanation string templates and deep-link destinations before dev starts. |

### Done when
- [ ] `GET /api/projects/:id/progress?breakdown=true` returns full sub-score shape with real values
- [ ] Default progress endpoint unchanged
- [ ] CLIENT role still receives only `{ percentComplete }`
- [ ] Explanation strings contain actual numbers, not placeholders
- [ ] Panel expands and collapses correctly in UI

---

## Sprint 3 — Find Help (Contributor Skill Match)
**Starts after Sprint 2 is merged. BLOCKED until PM confirms 2 decisions.**

> [!CAUTION]
> **Two decisions must be made before Sprint 3 code starts. PM owns both.**
>
> **Decision 1 — Skills list.** What values can a user set as their skills?
> Suggested: `frontend, backend, design, qa, devops, data, product`
> Once the database migration runs, adding new values requires another migration. Choose carefully.
>
> **Decision 2 — Assign behaviour.** Clicking "Assign" replaces the current assignee. The old assignee is removed. No co-assignee in this version. Is that acceptable for MVP?

### What it does
A "Find Help" button appears on blocked or overdue task cards. Clicking it shows a panel of contributors sorted by who has the most capacity and the right skills. PM clicks "Assign" and the task is immediately reassigned.

### How matching works
1. Read the task's labels (e.g. "backend", "design")
2. Match label names against the skills enum (case-insensitive)
3. Filter contributors: must have that skill, must have ≥50% completion rate, must have no recently-blocked tasks (blocked in the last 7 days — not older)
4. Sort by availability score: `(100 - completionRate) × (open tasks + 1)`

### Assign behaviour
- Task has no assignee → assign immediately, no confirmation
- Task already has an assignee → show confirmation: *"This will remove [name] and assign [name]. Are you sure?"*
- On error → revert the UI, show inline error message

### What each team does

| Team | Task |
|---|---|
| **Backend** | Run DB migration to add `skills[]` to user table. Add `?phaseSkill`, `?minRate`, `?availableOnly` filters to team analytics API. Add `skills` field to profile update API. |
| **Frontend** | "Find Help" button on blocked/overdue task cards (PM + Admin only). Inline contributor panel with "Assign" button per row. Confirmation step if task already has an assignee. Skills multi-select on profile edit screen. Skills column on contributor list. |
| **QA** | Filter tests: skill match, minRate cutoff, 7-day blocked window. Confirm INTERN + CLIENT get 403. Confirm profile skills save correctly. |
| **Product** | Confirm skills list and assign semantics. Message the team to set their skills before launch. Monitor until ≥50% of active contributors have skills set. |

### ⚠️ Launch risk — empty skills on day one
All contributors will have no skills set after the migration runs. Every Find Help search will return zero results until they fill in their profiles.

**Before enabling the Find Help button in production:**
- [ ] Skills profile edit screen is live
- [ ] PM has asked all contributors to set their skills
- [ ] At least 50% of active project members have skills populated
- [ ] Empty state shows: *"No contributors have set skills yet. Ask your team to update their profiles."*
- [ ] Feature flag or PM toggle is in place to gate the button

### Done when
- [ ] `GET /api/analytics/team?phaseSkill=backend&minRate=50&availableOnly=true` returns correct filtered results
- [ ] Default team analytics response is unchanged without new params
- [ ] User with `skills = []` never appears in skill-filtered results
- [ ] User with a blocked task from 10 days ago IS included in `availableOnly=true` results
- [ ] User with a blocked task from 2 days ago is NOT included
- [ ] Assign confirmation fires when task has an existing assignee
- [ ] INTERN and CLIENT cannot reach the analytics endpoint (403)

---

## What Is NOT Being Built

| Cut Feature | Why |
|---|---|
| 7-day sparkline chart | Team too small — data shows `[0,0,0,0,0,1,0]`. Noise, not a trend. |
| Alert "Act Now" button | No alerts exist yet. A button with nothing behind it is worse than nothing. |
| Activity Level sub-score | Formula gives 90–100% on healthy AND stalled projects. It lies. |
| Co-assignee support | Requires a new database schema and separate UI. Post-MVP. |

---

## Sprint Summary

| Sprint | Feature | Schema Change? | Blockers |
|---|---|---|---|
| 1 | Urgency Sort | None | None — start now |
| 2 | Health Drill-Down | None | Sprint 1 must be merged |
| 3 | Find Help | Yes — adds `skills[]` to users | Sprint 2 merged + PM confirms 2 decisions |
