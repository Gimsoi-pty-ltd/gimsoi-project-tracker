# PRD: tracker-metrics

**Date:** 2026-05-05
**Author:** Antigravity Agent (feature-cycle Step 1)
**Status:** Draft

---

## Feature Summary

This feature implements a comprehensive set of 20 project and sprint-level metrics for the Gimsoi Project Tracker dashboard. It provides Project Managers and Admins with real-time insights into sprint health, team velocity, task distribution, and delivery risk by aggregating data across tasks, sprints, and phases.

---

## User Story

As a project manager,
I want to view a centralized dashboard of calculated project and sprint metrics,
so that I can accurately track progress, identify bottlenecks early, and assess the overall health and risk of my projects.

---

## Requirements

1. The system must support storing and retrieving a "Sprint Goal" for each sprint.
2. The system must support task estimation using "Story Points" and tracking of "Estimated Hours" and "Actual Hours".
3. The system must support a "Severity" classification for tasks (LOW, MEDIUM, HIGH, CRITICAL).
4. The system must support a "REVIEW" status in the task lifecycle.
5. The system must calculate Sprint Velocity based on the sum of Story Points of completed tasks in a sprint.
6. The system must calculate a "Sprint Health" score based on overdue and blocked task percentages.
7. The system must calculate "Impact Score" for overdue tasks based on their priority weights.
8. The system must calculate "Severity Index" for blocked tasks based on their severity weights.
9. The system must provide a distribution of tasks across all statuses (To-do, In Progress, Review, Done, Blocked).
10. The system must calculate delivery risk and delay rates based on overdue and blocked task counts.

---

## Acceptance Criteria

- [ ] AC1: `GET /api/sprints/:id/metrics` returns a JSON object containing all 20 calculated metrics for the specified sprint.
- [ ] AC2: `POST /api/sprints` accepts a `goal` string field and stores it correctly.
- [ ] AC3: `PATCH /api/tasks/:id` accepts `storyPoints` (Int), `severity` (Enum), `estimatedHours` (Float), and `actualHours` (Float).
- [ ] AC4: `PATCH /api/tasks/:id` allows transitioning a task to the `REVIEW` status according to the state machine rules.
- [ ] AC5: `GET /api/sprints/:id/metrics` by an unauthenticated user returns `401`.
- [ ] AC6: `GET /api/sprints/:id/metrics` by a user with `INTERN` or `CLIENT` role returns `403` (VIEW_ANALYTICS permission required).
- [ ] AC7: `GET /api/sprints/:id/metrics` with an invalid sprint ID returns `404`.

---

## Out of Scope

- Frontend implementation — this PRD covers the backend schema updates and API endpoints only.
- Historical trend tracking (e.g., Velocity Trend, Risk Trend) — these require time-series snapshotting which is deferred to a later sprint.
- Automated report generation (PDF/Excel) for these metrics.

---

## Open Questions

- [ ] What are the exact numerical weights to be used for each Priority (for Impact Score) and Severity (for Severity Index)?
- [ ] Should "Planned Tasks" for Sprint Progress calculation be defined as the total tasks assigned to the sprint at its start, or the current total? (Assuming current total for MVP).
