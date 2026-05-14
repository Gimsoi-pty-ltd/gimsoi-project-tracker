# Changes Made: `feat/search-reports-phases`

This update implements advanced organizational and analytical capabilities for the Gimsoi Project Tracker, introducing Global Search, Project Phases, PDF Reporting, Team Analytics, and Sprint Velocity tracking. It also finalizes schema extraction and decouples validation middleware from the business logic controllers for a cleaner architecture.

### Features Added

#### 1. Global Search
- **GET /api/search:** Enables searching across Projects, Tasks, and Users from a single query. Supports filtering by entity type.

#### 2. Project Phases
- **POST /api/phases & GET /api/phases:** Allows creating, retrieving, updating, and deleting chronological phases within projects, enabling more structured task organization.

#### 3. PDF Reporting
- **POST /api/reports & GET /api/reports/:id/pdf:** Provides functionality to generate analytical reports and directly export them as downloadable PDF streams.

#### 4. Team Analytics & Sprint Velocity
- **GET /api/analytics/team:** Returns aggregated task completion metrics grouped by user, efficiently supporting cursor-based pagination.
- **GET /api/sprints/:id/velocity:** Exposes sprint performance metrics by dynamically counting `DONE` tasks.

#### 5. Core Infrastructure & Security
- **Zod Validation Refactor:** Extracted all inline Zod schemas into the `schemas/` directory and integrated them into a generic route-level validation middleware.
- **Ownership & Access Control:** Added strict `assertOwnership` checks across all phase endpoints and corrected optimistic locking data mapping on sprints and users.
- **Service Bug Fixes:** Fixed global database reference errors in task state transition guards.

---

### Testing Instructions (`apps/backend`)

**1. Update Dependencies:**
```powershell
npm install
```

**2. Run Automated Integration Tests:**
```powershell
npm run test:api
```

**3. Target Specific Tests (optional):**
```powershell
npx playwright test tests/api/search-reports-phases.spec.js
```

---

### Self Verification Status
All 105 backend API tests have run and **PASSED** on the local environment.
