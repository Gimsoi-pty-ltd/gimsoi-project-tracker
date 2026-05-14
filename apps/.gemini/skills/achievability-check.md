# Achievability Check Skill

**Activates:** Step 7 of feature-cycle.md
**Model:** Pro recommended — feature-cycle.md will surface the model switch prompt before activating this skill
**Input:** PRD requirements list (from Step 1) + all code changes from all phases (PHASE_LOG)
**Output:** 1:1 requirement → code change mapping with MET/UNMET status

---

## Protocol

### Step 1 — Build the Requirements Index

Extract every numbered requirement from the PRD saved at `docs/prd-<feature-name>.md`.
Number them exactly as they appear. Do not reword them.

```
Requirements index:
R1: <exact text from PRD>
R2: <exact text from PRD>
...
RN: <exact text from PRD>
```

### Step 2 — Build the Change Index

From the PHASE_LOG, extract every file modification made across all phases.
For each file, note what was changed (new function, modified query, new route, new Zod schema, etc.).

```
Changes index:
C1: services/task.service.js — added getTasksByPriority() with Prisma orderBy
C2: controllers/task.controller.js — added getTasksByPriority handler, returns 200
C3: routes/task.route.js — registered GET /api/tasks/priority with auth + validation middleware
C4: schemas/task.schema.js — added priorityQuerySchema with Zod
...
```

### Step 3 — Map Requirements to Changes

For each requirement Rn, identify which change(s) Cx directly implement it.
A requirement is MET only if there is at least one code change that directly implements it.
A requirement is UNMET if no code change corresponds to it.

```
R1 → C1, C2 — MET
R2 → C3, C4 — MET
R3 → (none) — UNMET
```

### Step 4 — Flag UNMET Requirements

For each UNMET requirement, provide:
- The exact requirement text
- Why no code change covers it
- Which phase or file would be needed to cover it

---

## Output Format

```
## Achievability Check — <feature-name>
PRD: docs/prd-<feature-name>.md
Timestamp: <ISO timestamp>
Reviewed by: Achievability Check skill (Step 7)

### Requirement Mapping

| # | Requirement | Status | Code Change(s) |
|---|---|---|---|
| R1 | <requirement text> | ✅ MET | C1, C2 |
| R2 | <requirement text> | ✅ MET | C3 |
| R3 | <requirement text> | ❌ UNMET | none |

### UNMET Requirements

**R3:** <exact requirement text>
- Gap: <why no code change covers this>
- Resolution needed: <which file/function/phase would close the gap>

### Summary
Total requirements: [N]
MET: [X] (✅)
UNMET: [Y] (❌)

Recommendation: [PROCEED TO FINAL REPORT | RESOLVE UNMET REQUIREMENTS BEFORE PROCEEDING]
```

If all requirements are MET, output `PROCEED TO FINAL REPORT`.
If any are UNMET, output `RESOLVE UNMET REQUIREMENTS BEFORE PROCEEDING` and list the gaps.
The feature cycle does not proceed to Step 8 until the user explicitly approves proceeding
with known UNMET requirements or the gaps are resolved.
