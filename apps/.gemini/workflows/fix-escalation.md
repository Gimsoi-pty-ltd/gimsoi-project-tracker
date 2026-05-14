# Fix Escalation Workflow

**Trigger:** Automatically on COMPLEX phase failure, or manually via `/escalate`

This workflow generates a sub-implementation-plan for a complex failure and
surfaces it to the user for explicit approval. It never proceeds without approval.

---

## Step 1 — Failure Summary

Collect and display:

```
❌ ESCALATION TRIGGERED
Phase: <N>
Timestamp: <ISO timestamp>
Failing test(s):
  - <test name 1> — <one-line failure reason>
  - <test name 2> — <one-line failure reason> (if multiple)

Root cause:
<2–4 sentence explanation of why the test is failing and what the implementation gap is>
```

---

## Step 2 — Fix Classification

Analyse what the fix requires:

```
Fix Classification: COMPLEX

Files affected:
  - <file 1> — <layer: controller | service | route | middleware | schema>
  - <file 2> — <layer>
  - (add all files the fix touches)

Layers crossed:
  - <layer A> → <layer B>
  (list each cross-layer dependency the fix introduces)

Why this is COMPLEX:
<One sentence — e.g. "The fix requires adding a new field to the service query and
updating the controller response shape, crossing the service→controller boundary.">
```

---

## Step 3 — Model Switch Recommendation

If the fix crosses more than 2 layers or touches more than 4 files, surface:

```
⚡ MODEL SWITCH RECOMMENDED
Current: [current model]
Recommended: Pro
Reason: Cross-layer fix planning requires multi-file reasoning
Token cost: Medium
To continue on Flash anyway, type: "Flash continue"
To switch to Pro, change the model in Antigravity and type: "Pro ready"
```

Wait for "Flash continue" or "Pro ready" before generating the sub-plan.

---

## Step 4 — Sub-Implementation-Plan

Generate a sub-plan using the format from `templates/phase-plan-template.md`.
The sub-plan may have multiple sub-phases if needed. Each sub-phase is a
complete phase-plan-template entry.

Label sub-phases as `<original-phase>.<sub>` — e.g. Phase 2 escalation sub-phases
are `2.1`, `2.2`, etc.

Display the full sub-plan:

```
## Sub-Implementation-Plan for Phase <N> Escalation

<Full phase-plan-template entries for 2.1, 2.2, etc.>
```

---

## Step 5 — Approval Gate

After displaying the sub-plan, output exactly:

```
⏸️ AWAITING APPROVAL
Review the sub-implementation-plan above.
Type "Approved" to proceed with sub-phase execution.
Any other response will be treated as a request to revise the plan.
```

**The agent must not modify any file until the user types the word "Approved".**
If the user types anything else, treat it as revision feedback, update the plan,
and re-display the approval prompt.

---

## Step 6 — Execution After Approval

Once "Approved" is received:
1. Execute each sub-phase using `workflows/phase-runner.md`
2. Run `npm run test:api` after each sub-phase
3. If any sub-phase fails, repeat the escalation workflow from Step 1
4. On full PASS, resume the original feature cycle at the next phase
