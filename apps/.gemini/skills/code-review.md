# Code Review Skill

**Activates:** Step 6 of feature-cycle.md
**Model:** Pro recommended — feature-cycle.md will surface the model switch prompt before activating this skill
**Input:** All files modified across all phases of the current feature
**Output:** Severity-annotated issue list — issues only, no rewrites

---

## Review Protocol

Run all 7 checklist items in order. Do not re-order them.
Do not skip items even if the feature appears simple.

---

### 1. Error Handling

Check every `async` function in the modified files:
- Is it wrapped in `try/catch`?
- Does the `catch` block include context about which operation failed?
- Is the error re-thrown or converted to an HTTP response — not swallowed?

Flag any `async` function with no `try/catch`, an empty catch, or a `catch (e) { console.error(e) }` pattern.

---

### 2. Prisma Usage

- Is `@prisma/client` imported only in `services/` files?
- Are `P2025` (record not found) and `P2002` (unique constraint) caught explicitly?
- Is `prisma.$queryRaw` or `prisma.$executeRaw` used anywhere? (Always CRITICAL)
- Does the service check existence before delete operations?

---

### 3. ESM Compliance

- Any `require()` call? (Always CRITICAL)
- Any `module.exports`? (Always CRITICAL)
- Do all relative imports include the `.js` extension?
  Example: `import { foo } from './utils/helpers'` is WRONG.
  `import { foo } from './utils/helpers.js'` is correct.

---

### 4. Input Validation

- Is `req.body` validated with a Zod schema before the controller calls the service?
- Is validation happening in route middleware — not inside the controller function?
- Does invalid input return `400` before any database operation?

---

### 5. HTTP Correctness

Check status codes used in modified controllers:
- `200` for successful GETs and updates
- `201` for successful POSTs that create a resource
- `204` for successful DELETEs (no body)
- `400` for validation failure
- `401` for unauthenticated
- `403` for authorised user without permission
- `404` for resource not found
- `409` for unique constraint violation

Flag any mismatch between operation semantics and the returned status code.

---

### 6. Idempotency

- Are write operations safe to retry?
- Does a double-POST create a duplicate, or does it gracefully handle the P2002?
- Does a double-DELETE fail silently or throw a 404 that causes the caller to crash?

---

### 7. Scope

- Were any files modified that are not listed in any phase plan?
- Were any files in the off-limits list (`server.js`, `middleware/`, `lib/generated/`,
  `prisma/schema.prisma` unless planned) modified?

---

## Output Format

```
## Code Review — <feature-name>
Reviewed files: [list]
Reviewed by: Code Reviewer persona (Step 6)
Timestamp: <ISO timestamp>

### Issues

[CRITICAL] path/to/file.js:LINE — one-line explanation
[WARNING] path/to/file.js:LINE — one-line explanation
[SUGGESTION] path/to/file.js:LINE — one-line explanation

### Summary
CRITICAL: [count]
WARNING: [count]
SUGGESTION: [count]
```

If no issues found for a category:
```
[CRITICAL] None
```

**No rewrites. Issues only. If there is nothing to flag, say so explicitly.**

---

## WARNING Resolution Gate

After presenting the review output, if `WARNING count > 0`, surface this prompt and WAIT:

```
⚠️ WARNING RESOLUTION REQUIRED
This review found [N] WARNING(s):
  - [list each WARNING with file:line and description]

Choose how to proceed:
  1. "Resolve now" — I will fix the WARNING(s) before Step 7.
  2. "Defer: <justification>" — The WARNING(s) will be documented as OPEN in the Final Report.

I will not proceed to Step 7 until you choose.
```

Do not proceed to Step 7 until the user explicitly responds.
- If "Resolve now": apply fixes, re-run `npm run test:api`, then proceed to Step 7.
- If "Defer: <justification>": record each WARNING as `OPEN — Deferred: <justification>` in `REVIEW_ISSUES` and proceed to Step 7.

If `WARNING count == 0`, proceed to Step 7 immediately.
