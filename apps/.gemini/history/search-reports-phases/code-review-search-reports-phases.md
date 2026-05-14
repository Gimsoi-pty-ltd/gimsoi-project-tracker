# Code Review: `feat/search-reports-phases`

**Reviewer:** Antigravity (Senior Backend Engineer)
**Scope:** Search, Reports, Phases, Analytics, and Sprint Velocity.
**Date:** 2026-04-28

---

## 🛑 WARNING RESOLUTION GATE

The following items require explicit resolution before merging to `main`.

### 1. [WARNING] [HIGH] [Performance] Unbounded Team Analytics Aggregation
**File:** [analytics.service.js](file:///c:/Users/User/Desktop/data_01/gimsoi/gimsoi-project-tracker/apps/backend/services/analytics.service.js#L9-L43)
**Issue:** `getTeamPerformance` fetches every user in the database and *all* their tasks in a single query.
**Impact:** As the user base or task count grows, this endpoint will cause memory spikes and event-loop blocking.
**Recommendation:** Implement pagination for the user list or filter by "Active Users" within a specific time window.

### 2. [WARNING] [MEDIUM] [Architecture] Controller-Level Validation Pattern
**File:** Multiple controllers.
**Issue:** Zod parsing remains inside controller handlers rather than route-level middleware.
**Impact:** This was flagged in the previous cycle (`user-admin`). While consistent with the current codebase, it perpetuates a pattern that makes controllers harder to unit test in isolation.
**Resolution:** **Defer** to a future refactor or **Resolve** now by creating a `validate(schema)` middleware.

---

## 🔍 Detailed Analysis

### 1. Architecture (Tier: L)
- **Strengths:** Excellent separation of concerns. The `utils/pdf.js` is pure and agnostic of HTTP/Prisma context, making it highly reusable.
- **Observations:** The `getSprintVelocity` calculation is currently a simple `count`. This is correct for the current schema as no `storyPoints` field exists.

### 2. Security & RBAC
- **Phases:** `getPhaseById` lacks a project-level ownership check. An authenticated user with `VIEW_PHASES` could theoretically guess IDs to view phases of projects they aren't part of.
- **Reports:** Correctly implements an ownership guard in `getReportPdfHandler` preventing cross-user report scraping.

### 3. Performance & Scalability
- **Parallel Search:** The `globalSearch` service correctly uses `Promise.all` for parallel execution of 3 independent Prisma queries. This is optimal.
- **Search Limits:** Each category in the search is capped at 10 results, preventing unbounded data transfer.

### 4. Resilience
- **PDF Generation:** Using `PDFDocument` in a Promise wrapper handles the stream-to-buffer conversion safely.
- **Schema Cascadence:** `Phase` correctly uses `onDelete: Cascade` on the project relation, while `Task.phaseId` uses `onDelete: SetNull` to prevent task loss when a phase is deleted.

---

## 💡 Recommended Refactors

1. **[MINOR] [Maintainability]**: Centralize the status groups logic used in `pdf.js` and `analytics.service.js`. They currently implement similar status-counting logic independently.
2. **[MINOR] [Security]**: Add a `projectId` filter to `getPhaseById` or verify the user's project membership before returning phase details.

---

## Final Status: **ACTION REQUIRED**
Please review the **WARNINGS** above. You may type **"Resolve [Issue #]"** to have me fix them, or **"Defer [Issue #]"** to proceed with the merge.
