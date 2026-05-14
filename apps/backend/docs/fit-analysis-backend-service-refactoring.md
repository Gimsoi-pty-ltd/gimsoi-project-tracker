## Fit Analysis — backend-service-refactoring

### Axis 1 — Schema Impact: NO
- Changes required: none
- Risk: none

### Axis 2 — Route Collisions: NO
- Affected routes: none
- Risk: The refactoring is internal to the service layer and does not change the API contract or route definitions.

### Axis 3 — New Dependencies: NO
- Required packages: none
- Risk: none

### Axis 4 — Layer Violations: NO
- Risk areas: Refactoring targets the Service layer and a Utility file (`prismaErrors.js`). 
- Mitigation: Ensure `prismaErrors.js` remains the only place outside `services/` that references Prisma error classes, as per the existing codebase pattern.

### Axis 5 — Test Surface: 133 tests at risk
- At-risk tests:
  - `tests/api/tasks.spec.js` — covers `updateTask` and `bulkUpdateTasks` refactoring.
  - `tests/api/sprints.spec.js` — covers `updateSprint` refactoring and error handling.
  - `tests/api/projects.spec.js` — covers project upsert logic refactoring.
  - `tests/api/reports-upgrade.spec.js` — covers `report.service.js` optimization.
- Risk: Any regression in field mapping or error catching will be caught by the baseline suite. The "version mismatch" (409) logic is particularly critical to verify.

### Affected Files
- `apps/backend/utils/prismaErrors.js`
- `apps/backend/services/sprint.service.js`
- `apps/backend/services/task.service.js`
- `apps/backend/services/project.service.js`
- `apps/backend/services/report.service.js`

### Preliminary Impact Score: S
(All NO on Axis 1-4. Low architectural risk, high test coverage.)
