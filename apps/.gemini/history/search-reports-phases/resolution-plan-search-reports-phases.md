# Resolution Plan: `feat/search-reports-phases` Code Review

**Status:** Initiated
**Date:** 2026-04-28

---

## 🛠️ Planned Fixes

### 1. Architectural Refactor: Validation Middleware
- **Objective:** Extract Zod schema validation from controllers into a reusable middleware.
- **Affected:** `middleware/validate.middleware.js` (NEW), `controllers/phase.controller.js`, `controllers/report.controller.js`, `controllers/search.controller.js`.

### 2. Performance: Analytics Pagination
- **Objective:** Implement limit/cursor pagination for `getTeamPerformance` results.
- **Affected:** `services/analytics.service.js`, `controllers/analytics.controller.js`.

### 3. Security: Phase Ownership Guards
- **Objective:** Ensure users can only view/modify phases for projects they have access to.
- **Affected:** `services/phase.service.js`, `utils/ownership.js`.

---

## 🧪 Verification Plan
- **Regressions:** Run all 102 tests.
- **New Checks:** Add specific test cases for unauthorized phase access and analytics pagination.
