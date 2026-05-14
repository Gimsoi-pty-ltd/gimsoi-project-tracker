# Escalation Template

> **Instructions for agent:** Fill in every section when fix-escalation.md is triggered.
> This document is displayed to the user and must be complete before the approval prompt appears.

---

# Escalation Report — Phase {{PHASE_NUMBER}}

**Timestamp:** {{ISO timestamp}}
**Feature:** {{feature-name}}
**Triggered by:** {{COMPLEX phase failure | manual /escalate}}

---

## Failure Summary

**Phase that failed:** Phase {{PHASE_NUMBER}} — {{phase objective}}

**Failing test(s):**
- `{{test name 1}}` — {{one-line failure reason, e.g. "expected 404, received 500"}}
- `{{test name 2}}` — {{one-line failure reason}}

---

## Root Cause

{{2–4 sentences. Explain why the test is failing and what the implementation gap is.
Be specific — name the function, the Prisma query, the missing middleware, etc.
Do not write "the code is wrong." Write what specifically is wrong and why.}}

---

## Fix Classification

**Classification:** COMPLEX

**Files affected:**

| File | Layer |
|---|---|
| `{{path/to/file1.js}}` | `{{controller \| service \| route \| middleware \| schema}}` |
| `{{path/to/file2.js}}` | `{{layer}}` |
| `{{path/to/file3.js — add rows as needed}}` | `{{layer}}` |

**Layers crossed:**
- `{{layer A}}` → `{{layer B}}`
- `{{add more if applicable}}`

**Why COMPLEX:**
{{One sentence. Example: "The fix requires changing the Prisma query in task.service.js
and updating the response shape in task.controller.js, crossing the service→controller boundary."}}

---

## Sub-Implementation-Plan

{{Fill in one phase-plan-template entry per sub-phase.
Sub-phases are numbered as {{ORIGINAL_PHASE}}.1, {{ORIGINAL_PHASE}}.2, etc.}}

---

### Sub-Phase {{PHASE_NUMBER}}.1

**Objective:** {{one sentence}}

**Files to Touch:**
- `{{path/to/file.js}}`

**Expected `npm run test:api` Outcome:**
Tests expected to PASS: {{list}}
New tests: {{none | list}}

**Rollback:**
```bash
{{git checkout command}}
```

**Recommended model:** {{Flash | Pro}}

---

### Sub-Phase {{PHASE_NUMBER}}.2 (if needed)

{{Repeat the sub-phase block above. Remove if only one sub-phase is needed.}}

---

## Approval Prompt

⏸️ **AWAITING APPROVAL**

Review the sub-implementation-plan above.
Type **"Approved"** to proceed with sub-phase execution.
Any other response will be treated as revision feedback — the plan will be updated and re-presented.

> The agent will not modify any file until "Approved" is received.
