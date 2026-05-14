# Fit Analysis Skill

**Activates:** After PRD generation (Step 2 of feature-cycle.md)
**Input:** PRD requirements list
**Output:** Impact score (S/M/L) + affected files list + per-axis risk notes

This output feeds directly into the complexity classifier. Be precise.
Vague risk notes are not acceptable — name specific files and specific risks.

---

## The 5-Axis Check

Run all 5 axes against the current codebase. Do not skip any axis even if it
appears obviously clear.

---

### Axis 1 — Schema Impact

**Question:** Does this feature require adding, removing, or modifying models,
fields, relations, or indexes in `prisma/schema.prisma`?

**How to check:**
- Read the PRD requirements for any mention of new data attributes, new entities,
  or changed relationships between existing entities.
- Cross-reference with the current schema at `prisma/schema.prisma`.

**Output format:**
```
Axis 1 — Schema Impact: YES | NO | MAYBE
Changes required: [list specific model/field changes, or "none"]
Risk: [specific risk, e.g. "Adding avatarUrl nullable — existing rows unaffected" or "none"]
```

---

### Axis 2 — Route Collisions

**Question:** Does this feature add, remove, or modify existing HTTP routes?
Does it reuse a URL pattern that already exists?

**How to check:**
- Review route files in `routes/`: `auth.route.js`, `client.route.js`,
  `project.route.js`, `sprint.route.js`, `task.route.js`, `health.route.js`
- Check for URL pattern conflicts and method conflicts (GET vs POST on same path)

**Output format:**
```
Axis 2 — Route Collisions: YES | NO | MAYBE
Affected routes: [specific routes, e.g. "GET /api/tasks — adds optional ?projectId filter"]
Risk: [e.g. "Existing tests for GET /api/tasks may break if filter changes response shape"]
```

---

### Axis 3 — New Dependencies

**Question:** Does this feature require any npm package not currently in `package.json`?

**Current dependencies (from package.json):**
`@prisma/adapter-pg`, `@prisma/client`, `bcryptjs`, `cookie-parser`, `cors`,
`csrf-csrf`, `dotenv`, `express`, `express-rate-limit`, `jsonwebtoken`,
`method-override`, `nodemailer`, `pg`, `prisma`, `qs`, `swagger-jsdoc`,
`swagger-ui-express`, `zod`

**Dev:** `@playwright/test`, `cross-env`, `nodemon`

**Output format:**
```
Axis 3 — New Dependencies: YES | NO | MAYBE
Required packages: [list with justification, or "none"]
Risk: [e.g. "sharp for image processing — must flag for review before npm install"]
```

---

### Axis 4 — Layer Violations

**Question:** Can this feature be implemented without violating the
controller/service/Prisma boundary rules in `AGENTS.md`?

**How to check:**
- Map each PRD requirement to the layer(s) it touches
- Flag any requirement that would tempt a shortcut (e.g. querying Prisma in a controller)

**Output format:**
```
Axis 4 — Layer Violations: YES | NO | MAYBE
Risk areas: [specific requirements + which layer boundary is at risk]
Mitigation: [e.g. "Ensure avatarUrl update logic stays in auth.service.js, not controller"]
```

---

### Axis 5 — Test Surface

**Question:** Which existing test files in `tests/api/` are at risk of breaking?

**Current test files:**
`auth.spec.js`, `clients.spec.js`, `error-handling.spec.js`, `projects.spec.js`,
`rbac.spec.js`, `sprints.spec.js`, `task-lifecycle.spec.js`, `tasks.spec.js`

**How to check:**
- Map each route or service change from Axes 1–3 to the test files that cover them
- A test is at risk if it asserts on a response shape, status code, or data field
  that the feature will change

**Output format:**
```
Axis 5 — Test Surface: [N] tests at risk
At-risk tests:
  - tests/api/tasks.spec.js — GET /api/tasks response shape changes
  - tests/api/rbac.spec.js — new role check on new route
Risk: [specific assertion that may break]
```

---

## Final Output Format

```
## Fit Analysis — <feature-name>

### Axis 1 — Schema Impact: [YES|NO|MAYBE]
<details>

### Axis 2 — Route Collisions: [YES|NO|MAYBE]
<details>

### Axis 3 — New Dependencies: [YES|NO|MAYBE]
<details>

### Axis 4 — Layer Violations: [YES|NO|MAYBE]
<details>

### Axis 5 — Test Surface: [N] at risk
<details>

### Affected Files
[explicit list of every file that will be touched]

### Preliminary Impact Score: [S | M | L]
(S = all NO, M = any MAYBE, L = any YES on Axis 1 or 3, or >2 axes flagged)
```
