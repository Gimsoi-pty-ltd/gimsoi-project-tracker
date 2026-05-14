# Feature Cycle Workflow

**Trigger:** `/feature <description>`

This workflow orchestrates the full 8-step Gimsoi feature development cycle.
Each step's output is passed as explicit context to the next step.
Do not skip steps. Do not re-order steps.

---

## Pre-flight

Before starting, confirm:
1. `git status` is clean or the user has acknowledged uncommitted changes
2. `npm run test:api` passes on the current branch (baseline)

Record the baseline test count:
```
BASELINE: X tests passed, Y failed — <timestamp>
```

If the baseline is not clean, STOP and report:
```
⛔ BASELINE FAILURE
npm run test:api is currently failing. Feature cycle cannot start on a broken baseline.
Fix the baseline first, then re-trigger /feature.
```

---

## Step 1 — PRD Generation
**Model:** Current model (no switch needed)
**Skill:** `skills/prd-generator.md`

- Activate the `prd-generator` skill with the feature description from `/feature <description>`
- Produce a PRD following `templates/prd-template.md` exactly
- Save output to `apps/.gemini/history/<feature-name>/prd-<feature-name>.md`
- Display the PRD to the user and wait for acknowledgement before proceeding

```
✅ Step 1 complete — PRD saved to apps/.gemini/history/<feature-name>/prd-<feature-name>.md
Proceeding to Step 2: Fit Analysis
```

---

## Step 2 — Fit Analysis
**Model:** Current model (no switch needed)
**Skill:** `skills/fit-analysis.md`

- Input: PRD requirements list from Step 1
- Run the 5-axis fit analysis against the current codebase
- Output: impact score (S/M/L) + affected files list + per-axis risk notes
- Store the full fit analysis output as `FIT_ANALYSIS` context for Step 3

```
✅ Step 2 complete — Fit analysis: [score], [N] files affected
Proceeding to Step 3: Complexity Classification
```

---

## Step 3 — Complexity Classification
**Model:** Current model — but see model switch prompt below
**Skill:** `skills/complexity-classifier.md`

- Input: `FIT_ANALYSIS` from Step 2
- Apply the S/M/L classification rules from `complexity-classifier.md`
- Output: label + rationale paragraph

**If classification is L**, surface this prompt and WAIT for response before Step 4:

```
⚡ MODEL SWITCH RECOMMENDED
Current: Flash
Recommended: Pro
Reason: Large-complexity feature — phase planning requires cross-file reasoning across multiple layers
Token cost: High
To continue on Flash anyway, type: "Flash continue"
To switch to Pro, change the model in Antigravity and type: "Pro ready"
```

Do not proceed to Step 4 until the user types "Flash continue" or "Pro ready".
If classification is S or M, proceed to Step 4 immediately.

```
✅ Step 3 complete — Classification: [S/M/L], model: [current]
Proceeding to Step 4: Phase Planning
```

---

## Step 4 — Phase Planning
**Model:** As confirmed in Step 3
**Skill:** `skills/phase-planner.md`

- Input: `FIT_ANALYSIS` from Step 2 + classification from Step 3
- Derive minimum viable phases — not a fixed count
- Each phase entry follows `templates/phase-plan-template.md` exactly
- Schema changes always get their own isolated phase
- Save the phase plan to `apps/.gemini/history/<feature-name>/phase-plan-<feature-name>.md`
- Display all phase entries to the user before execution

```
✅ Step 4 complete — [N] phases planned
```

After displaying the phase plan, surface this prompt and WAIT:

```
🔁 MODEL SWITCH — RETURN TO FLASH
Step 4 (Phase Planning) is complete.
Steps 5 is best run on Flash — code execution does not require Pro reasoning.

Switch back to Flash in Antigravity, then type: "Flash ready"
To stay on Pro for execution anyway, type: "Pro continue"
```

Do not proceed to Step 5 until the user responds.

```
Proceeding to Step 5: Phase Execution Loop
```

---

## Step 5 — Phase Execution Loop
**Model:** Current model
**Workflow:** `workflows/phase-runner.md` (per phase)

For each phase in the plan, execute `/run-phase <N>`:

```
FOR each phase N in [1..total]:
  → activate workflows/phase-runner.md with phase N context
  → run npm run test:api
  → IF PASS:
      log: ✅ Phase N PASSED — <timestamp> — files: [list]
      continue to phase N+1
  → IF FAIL (SIMPLE — 1 file, same layer):
      fix inline
      re-run npm run test:api
      IF PASS: log ✅ and continue
      IF FAIL again: escalate as COMPLEX
  → IF FAIL (COMPLEX — >1 file OR cross-layer):
      STOP
      activate workflows/fix-escalation.md
      wait for "Approved" from user
      re-run current phase after approval
END FOR
```

Record per-phase results as `PHASE_LOG` for Step 8.

```
✅ Step 5 complete — All phases passed
Proceeding to Step 6: Code Review
```

---

## Step 6 — Code Review
**Model:** Recommend Pro — surface switch prompt and WAIT

Surface this prompt before starting the review:

```
⚡ MODEL SWITCH RECOMMENDED
Current: [current model]
Recommended: Pro
Reason: Multi-file correctness analysis across controllers, services, and routes
Token cost: Medium
To continue on Flash anyway, type: "Flash continue"
To switch to Pro, change the model in Antigravity and type: "Pro ready"
```

Wait for "Flash continue" or "Pro ready".

**Skill:** `skills/code-review.md`

- Input: all files modified across all phases
- Run the 7-point review checklist in order
- Output: severity-annotated issue list
- Store as `REVIEW_ISSUES` for Step 8

```
✅ Step 6 complete — [N] issues: [X] CRITICAL, [Y] WARNING, [Z] SUGGESTION
```

After presenting the review output and resolving any WARNINGs, surface this prompt and WAIT:

```
🔁 MODEL SWITCH — RETURN TO FLASH
Step 6 (Code Review) is complete.
Step 7 (Achievability Check) also recommends Pro — but Step 8 onward is Flash.
If you stayed on Pro through Steps 6 and 7, switch back to Flash before Step 8.

To proceed to Step 7 on Pro: type "Pro continue"
To switch to Flash first and confirm Step 7 on Flash: type "Flash continue"
```

Do not proceed to Step 7 until the user responds.

```
Proceeding to Step 7: Achievability Check
```

---

## Step 7 — Achievability Check
**Model:** Recommend Pro — surface switch prompt and WAIT

Surface this prompt before starting:

```
⚡ MODEL SWITCH RECOMMENDED
Current: [current model]
Recommended: Pro
Reason: PRD-to-code mapping requires full reasoning across all phase changes
Token cost: Medium
To continue on Flash anyway, type: "Flash continue"
To switch to Pro, change the model in Antigravity and type: "Pro ready"
```

Wait for "Flash continue" or "Pro ready".

**Skill:** `skills/achievability-check.md`

- Input: PRD requirements list (from Step 1) + all code changes from all phases
- Produce 1:1 requirement → code change mapping
- Flag any requirement with no corresponding code change as UNMET
- Store as `ACHIEVABILITY_MAP` for Step 8

```
✅ Step 7 complete — [N] requirements: [X] MET, [Y] UNMET
```

After presenting the achievability map, surface this prompt and WAIT:

```
🔁 MODEL SWITCH — RETURN TO FLASH
Step 7 (Achievability Check) is complete. Steps 8, 8.5, and 8.6 are reporting
and formatting tasks — Flash is sufficient and significantly cheaper.

Switch back to Flash in Antigravity, then type: "Flash ready"
To stay on Pro for reporting anyway, type: "Pro continue"
```

Do not proceed to Step 8 until the user responds.

```
Proceeding to Step 8: Final Report
```

---

## Step 8 — Final Report
**Model:** Current model (Flash is fine)

- Input: `BASELINE`, `FIT_ANALYSIS`, `PHASE_LOG`, `REVIEW_ISSUES`, `ACHIEVABILITY_MAP`
- Produce the final report following `templates/final-report-template.md` exactly
- Save output to `apps/.gemini/history/<feature-name>/final-report-<feature-name>.md`
- Display the report in full

```
✅ Step 8 complete — apps/.gemini/history/<feature-name>/final-report-<feature-name>.md
```

---

## Step 8.5 — Changes Made (PR Description)
**Model:** Current model (Flash is fine)
**Skill:** `templates/changes-made-template.md`

- Input: Final Report (Step 8) + PHASE_LOG
- Fill in `templates/changes-made-template.md` with the feature's user-facing summary
- Save output to `apps/.gemini/history/<feature-name>/changes-made-<feature-name>.md`
- Display the completed document to the user

```
✅ Step 8.5 complete — Changes Made document saved
Proceeding to Step 8.6: Git Commit Plan
```

---

## Step 8.6 — Git Commit Plan
**Model:** Current model (Flash is fine)
**Skill:** `skills/git-commit.md`

- Input: PHASE_LOG (all modified files grouped by phase)
- Activate `skills/git-commit.md` to produce the layered commit sequence
- Output the ready-to-copy git commands
- Do NOT execute `git` commands — present them for the user to run

```
✅ Feature cycle complete.
All artifacts saved to: apps/.gemini/history/<feature-name>/
Git commit plan ready — copy and paste the commands above to push your branch.
```
