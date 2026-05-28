# PRD: Project Membership Model and API

**Date:** 2026-04-29
**Author:** Antigravity Agent (feature-cycle Step 1)
**Status:** Draft

---

## Feature Summary

The Gimsoi Project Tracker currently stores only a `createdByUserId` string on the `Project` model — there is no concept of project team membership. This means any authenticated user can access tasks, phases, and sprints belonging to any project, violating multi-tenant data isolation. This feature introduces a `ProjectMember` join table that records which users belong to which projects and in what capacity (OWNER, MEMBER, or VIEWER). It exposes a full CRUD membership API under `/api/projects/:id/members` and retrofits resource-scoped guards across task, phase, and sprint access so that only project members can reach project-scoped data. The primary users are Admins and Project Managers who need to explicitly curate a project team, and all authenticated users who need their data access correctly scoped to the projects they belong to.

---

## User Story

As a **project manager**,
I want to **explicitly add users to a project with a defined role (OWNER, MEMBER, or VIEWER)**,
so that **only the correct team members can access and modify that project's tasks, phases, and sprints**.

---

## Requirements

1. A user can be added to a project with one of three roles: OWNER, MEMBER, or VIEWER.
2. A project can have many members; a user can be a member of many projects.
3. Adding the same user to the same project twice must be rejected as a duplicate.
4. Only users with ADMIN or PM global role may add, remove, or change the role of a project member.
5. Any authenticated user may list the members of a project.
6. A project member's role can be updated independently (without removing and re-adding).
7. A member can be removed from a project; removal does not delete the user.
8. When a project is deleted, all its membership records must also be deleted (cascade).
9. Only project members (plus global ADMIN and PM) may access tasks scoped to a project.
10. Only project members (plus global ADMIN and PM) may access phases scoped to a project.
11. Only project members (plus global ADMIN and PM) may access sprints scoped to a project.
12. When a task is created with an `assigneeId`, the assignee must be a member of the project.
13. The membership list response must include `userId`, `fullName`, `email`, `avatarUrl`, and `role` for each member.
14. The `createdByUserId` of a project must automatically be enrolled as an OWNER member when the project is created.

---

## Acceptance Criteria

- [ ] AC1: `POST /api/projects/:id/members` with `{ userId, role: "MEMBER" }` by an ADMIN returns `201` and `{ success: true, data: { id, projectId, userId, role, createdAt } }`
- [ ] AC2: `POST /api/projects/:id/members` with the same `userId` twice returns `409` (duplicate membership)
- [ ] AC3: `POST /api/projects/:id/members` by an INTERN or CLIENT returns `403`
- [ ] AC4: `POST /api/projects/:id/members` without authentication returns `401`
- [ ] AC5: `POST /api/projects/:id/members` with an invalid `role` value returns `400`
- [ ] AC6: `GET /api/projects/:id/members` by any authenticated user returns `200` and an array where each item includes `userId`, `fullName`, `email`, `avatarUrl`, and `role`
- [ ] AC7: `PATCH /api/projects/:id/members/:userId` with `{ role: "VIEWER" }` by an ADMIN returns `200` with the updated role
- [ ] AC8: `PATCH /api/projects/:id/members/:userId` by an INTERN returns `403`
- [ ] AC9: `DELETE /api/projects/:id/members/:userId` by an ADMIN returns `204`
- [ ] AC10: `DELETE /api/projects/:id/members/:userId` by an INTERN returns `403`
- [ ] AC11: `GET /api/tasks?projectId=:id` by a user who is NOT a project member and is NOT ADMIN/PM returns `403`
- [ ] AC12: `GET /api/tasks?projectId=:id` by a user who IS a project member returns `200`
- [ ] AC13: `POST /api/tasks` with an `assigneeId` of a user who is NOT a project member returns `400`
- [ ] AC14: `POST /api/projects` automatically creates an OWNER membership for the creating user
- [ ] AC15: `GET /api/projects/:id/members` for a non-existent project returns `404`

---

## Out of Scope

- **Frontend implementation** — this PRD covers the REST API only; no UI changes.
- **Email notifications** — no email is sent when a user is added to or removed from a project.
- **Per-member permission overrides** — the `role` field (OWNER/MEMBER/VIEWER) is stored but does not yet drive granular write permissions beyond read isolation; fine-grained per-member permission enforcement is a future iteration.
- **Sprint and Phase membership guards** — enforcing that sprint/phase access requires project membership is tracked under the same feature but uses the same helper; if complexity demands, it can be deferred to Wave 2.
- **Self-service membership requests** — users cannot request to join a project; only Admins and PMs can add members.

---

## Open Questions

- [ ] **Auto-enroll on task assign**: When a PM assigns a task to a user who is not yet a project member, should the API auto-enroll them as MEMBER, or return a 400? (Decision: return 400 — explicit membership required, per requirement 12.)
- [ ] **OWNER removal**: Can the project OWNER membership record be deleted? If the only OWNER is removed, the project becomes ownerless. (Decision: Allow removal — the project's `createdByUserId` field remains as the original audit trail; ownership enforcement is the PM's responsibility.)
