# Phase Runner Workflow

**Trigger:** `/run-phase <phase-number>`

Executes a single phase from the feature phase plan.
This workflow is called by `feature-cycle.md` Step 5 and can also be triggered manually.

---

## Pre-conditions

Before executing, confirm:
1. The phase plan entry for `<phase-number>` is available in context
2. No uncommitted changes exist outside the files listed for this phase
3. The previous phase (if any) has a recorded PASS result

If any pre-condition fails, STOP and report the specific failure before proceeding.

---

## Execution Protocol

### 1. Read the Phase Plan Entry

Extract from the phase plan entry:
- `Phase Number`
- `Objective`
- `Files to Touch` (explicit list — these are the ONLY files to modify)
- `Expected test:api outcome`
- `Rollback instruction`
- `Recommended model`

### 2. Execute the Phase

- Modify only the files listed under `Files to Touch`
- If a required change is outside those files, STOP immediately:
  ```
  ⛔ SCOPE VIOLATION DETECTED
  Phase [N] plan lists: [files]
  Required change is in: [unlisted file]
  This is a COMPLEX escalation. Triggering fix-escalation workflow.
  ```
  Then activate `workflows/fix-escalation.md`.

- Apply all ESM, error handling, and layer boundary rules from `AGENTS.md`
- If the phase involves a schema change, run `npx prisma generate` before running tests

### 3. Run the Gate

```bash
npm run test:api
```

Record the result immediately.

**If the agent's terminal cannot execute `npm run test:api`** (e.g. PowerShell execution policy blocks npm, or the command exits with `UnauthorizedAccess`), do NOT proceed. STOP and surface:

```
⛔ GATE BLOCKED — Manual Run Required
The agent cannot execute npm run test:api on this system.
Run the following in your terminal:

  npm run test:api

Then report back:
  - "PASS" to continue to the next phase
  - "FAIL: <test name>" to trigger fix classification

I will not proceed until you report the result.
```

---

## Result Handling

### PASS
```
✅ Phase <N> PASSED
Timestamp: <ISO timestamp>
Files modified: [explicit list]
Tests: [X passed / Y total]
```

Yield control back to the feature cycle. Do not proceed to the next phase
on your own — the feature cycle orchestrator drives sequencing.

### FAIL — Classify the fix

Examine what the failing test requires and classify:

**TRANSIENT** — DB connection timeouts or pool exhaustion errors:
```
[WebServer] Error: Connection terminated due to connection timeout
[WebServer] Error: timeout exceeded when trying to connect
```
```
⚠️ Phase <N> FAILED — TRANSIENT (DB connection noise)
Re-running npm run test:api once...
```
Re-run `npm run test:api` immediately with no code changes.
- If PASS on retry: log `✅ Phase <N> PASSED (transient, retry succeeded)` and return.
- If FAIL again: reclassify — check if failures are now SIMPLE or COMPLEX.

**SIMPLE** — fix is confined to 1 file, same architectural layer as the change:
```
⚠️ Phase <N> FAILED — SIMPLE fix
Failing test: <test name from playwright output>
Fix: <one-sentence description>
File: <single file>
Layer: <controller | service | route>
Applying fix and re-running npm run test:api...
```
Apply the fix inline, re-run `npm run test:api`.
- If PASS: log `✅ Phase <N> PASSED (after SIMPLE fix)` and return
- If FAIL again: reclassify as COMPLEX and trigger escalation

**COMPLEX** — fix requires >1 file OR crosses architectural layers:
```
❌ Phase <N> FAILED — COMPLEX escalation required
Failing test: <test name>
Files affected: [list]
Layers crossed: [list]
Triggering fix-escalation workflow...
```
Activate `workflows/fix-escalation.md`. Do not make any code changes.
Wait for user "Approved" before re-running the phase.

---

## Phase Log Entry Format

After every phase (PASS or FAIL), append to the `PHASE_LOG`:

```
Phase <N> | <PASS|FAIL> | <ISO timestamp>
Objective: <objective from plan>
Files touched: [list]
Test result: <X passed, Y failed>
Fix applied: <none | SIMPLE: description | COMPLEX: escalated>
```
