# PRD: Backend Service Refactoring

**Date:** 2026-05-13
**Author:** Antigravity Agent (feature-cycle Step 1)
**Status:** Draft

---

## Feature Summary

This feature involves a comprehensive refactoring of the Gimsoi Project Tracker backend services (`task.service.js`, `sprint.service.js`, `project.service.js`, and `report.service.js`). The goal is to reduce technical debt by eliminating redundant object literals, abstracting repetitive Prisma concurrency error handling (P2025), and optimizing inefficient array traversals. This refactoring maintains strict architectural boundaries and ESM compliance.

---

## User Story

As a developer,
I want to simplify and centralize repetitive logic in the backend services,
so that the codebase is more maintainable, readable, and resilient to concurrency issues.

---

## Requirements

1. The system must provide a centralized utility to handle Prisma concurrency errors (P2025) and map them to domain-specific ConflictErrors.
2. The `task.service.js` must use dynamic field mapping for updates to replace large, manual object literals.
3. The `project.service.js` must eliminate redundant payload definitions in upsert operations.
4. The `report.service.js` must use efficient single-pass array traversals (e.g., `reduce`) instead of chained `filter`/`map` operations.
5. The refactoring must preserve the existing optimistic locking (`version` increment) behavior.

---

## Acceptance Criteria

- [ ] AC1: `PATCH /api/tasks/:id` with valid data returns `200 OK` and the updated task object.
- [ ] AC2: `PATCH /api/tasks/:id` with a version mismatch returns `409 Conflict` with a "modified by another user" message.
- [ ] AC3: `GET /api/reports/:id` returns the same report structure as before the refactoring.
- [ ] AC4: `PATCH /api/sprints/:id` correctly handles non-existent sprints by returning `404 Not Found`.
- [ ] AC5: All 133 existing API tests in `npm run test:api` pass without regression.

---

## Out of Scope

- Frontend implementation — this refactoring covers backend services only.
- Database schema changes — no migrations are included in this feature.
- Changes to controller logic or route definitions.

---

## Open Questions

None.
