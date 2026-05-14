# PRD: seed-dashboard

**Date:** 2026-05-05
**Author:** Antigravity Agent (feature-cycle Step 1)
**Status:** Draft

---

## Feature Summary

This feature expands the existing `prisma/seed.js` script to populate the Gimsoi Project Tracker database with a comprehensive, realistic dataset. This includes multi-sprint projects, diverse task distributions across all statuses, priorities, and severities, and populated metrics fields. The goal is to ensure that dashboard views, analytics endpoints, and reports render meaningful data immediately after seeding, facilitating better development, testing, and demonstration of the tracker's metrics capabilities.

---

## User Story

As a developer or project manager,
I want a database populated with realistic multi-sprint project data,
so that I can verify the accuracy of dashboard metrics and report generation without manually creating dozens of tasks.

---

## Requirements

1. Expand `prisma/seed.js` to create at least 2 projects with multiple members (PM, Intern, Client).
2. Seed at least 2 sprints per project with varying statuses (PLANNING, ACTIVE, CLOSED).
3. Populate each sprint with at least 15 tasks distributed across all `TaskStatus` values (TODO, IN_PROGRESS, REVIEW, DONE, BLOCKED, CANCELLED).
4. Assign realistic values to metrics-related fields: `storyPoints`, `estimatedHours`, `actualHours`, `priority`, and `severity`.
5. Ensure at least 3 tasks per sprint are marked as `BLOCKED` with varying `severity` levels.
6. Ensure at least 3 tasks per sprint have `dueDate` values in the past (overdue) to trigger "Overdue" metrics.
7. Set `completedAt` timestamps for all `DONE` tasks.
8. Set a `goal` for each seeded sprint.

---

## Acceptance Criteria

- [ ] AC1: Running `npx prisma db seed` completes without errors and populates all tables.
- [ ] AC2: `GET /api/sprints/:id/metrics` for a seeded ACTIVE sprint returns non-zero values for `velocity`, `completionPercentage`, and `totalTasks`.
- [ ] AC3: `GET /api/sprints/:id/metrics` for a seeded sprint with overdue tasks returns an `impactScore` > 0.
- [ ] AC4: `GET /api/sprints/:id/metrics` for a seeded sprint with blocked tasks returns a `severityIndex` > 0.
- [ ] AC5: `GET /api/tasks?projectId=:id` returns the full distribution of seeded tasks for that project.

---

## Out of Scope

- Frontend implementation — this PRD covers the data seeding logic only.
- Automated scheduling of the seed script — it remains a manual trigger.
- Integration with external tools (e.g., Zoho) during the seeding process.

---

## Open Questions

- [ ] None.
