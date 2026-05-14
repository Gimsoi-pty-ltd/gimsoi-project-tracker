# Phase Plan Template

> **Instructions for agent:** Fill in every field for every phase.
> No field may be left blank or vague. "Related files" is not an acceptable files list.
> Use this template once per phase. Phases are numbered sequentially from 1.

---

## Phase {{PHASE_NUMBER}}

**Objective:** {{ONE SENTENCE — what this phase achieves, not how it does it.
Example: "Add priority field to Task model and regenerate Prisma client."
Example: "Implement getTasksByPriority service function with orderBy and pagination."}}

---

### Files to Touch

{{Explicit list — full relative paths from apps/backend/. No wildcards. No "etc."}}

- `{{path/to/file1.js}}`
- `{{path/to/file2.js}}`
- `{{path/to/file3.js — add or remove as needed}}`

---

### Expected `npm run test:api` Outcome

{{Be specific. Name which test files are expected to pass. Name any tests that
may be skipped or newly added in this phase.}}

**Tests expected to PASS:** {{e.g. "All existing tests in tests/api/tasks.spec.js and tests/api/rbac.spec.js"}}
**New tests added this phase:** {{e.g. "None" or "tests/api/task-priority.spec.js (3 new cases)"}}
**Tests expected to be unaffected:** {{e.g. "auth.spec.js, clients.spec.js, sprints.spec.js"}}

---

### Rollback Instruction

{{Specific command(s) to undo this phase without affecting other phases.
Must be a runnable command, not a description.}}

```bash
{{e.g. git checkout apps/backend/services/task.service.js apps/backend/controllers/task.controller.js}}
{{e.g. git checkout apps/backend/prisma/schema.prisma && npx prisma generate}}
```

---

### Recommended Model

{{Informational only — the user controls the actual model in Antigravity.}}

**Recommended:** {{Flash | Pro}}
**Reason:** {{One sentence — e.g. "Single-file service layer change, no cross-layer reasoning needed."
or "Schema and migration planning requires cross-file reasoning — Pro recommended."}}
