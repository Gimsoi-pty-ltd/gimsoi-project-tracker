# PRD: User Administration

**Date:** 2026-04-28
**Author:** Antigravity Agent (feature-cycle Step 1)
**Status:** Draft

---

## Feature Summary
Implement a comprehensive User Management system for the Gimsoi Project Tracker. This includes admin-only capabilities to list, create, and manage user roles, as well as self-service profile management for all authenticated users (profile updates and avatar uploads). This feature bridges the gap between basic auth and full RBAC-controlled administration.

---

## User Story
As an **Admin**, I want to manage the user list and assign specific roles to team members, so that I can control access levels within the organization.
As a **User**, I want to update my profile and avatar, so that my identity is accurate in the system.

---

## Requirements
1. **Admin User Listing:** Provide a paginated list of all users, accessible only by users with the `ADMIN` role.
2. **Admin User Creation:** Allow admins to create new users with an explicit role (`ADMIN`, `PM`, `INTERN`, `CLIENT`), bypassing the standard self-registration limitations.
3. **Admin Role Management:** Allow admins to update the role of any existing user.
4. **Self-Service Profile Update:** Allow any authenticated user to update their own `fullName` and `email`.
5. **Avatar Upload:** Allow any authenticated user to upload an image to be used as their profile avatar.
6. **Client Dropdown Support:** Ensure `GET /clients` is functional and provides the necessary data (`id`, `name`) for project creation.

---

## Acceptance Criteria
- [ ] AC1: `GET /api/users` (admin only) returns 200 with paginated user objects.
- [ ] AC2: `POST /api/users` (admin only) returns 201 and creates a user with the specified role.
- [ ] AC3: `PATCH /api/users/:id/role` (admin only) returns 200 and updates the user's role.
- [ ] AC4: `PATCH /api/users/me` returns 200 and updates the current user's `fullName` and `email`.
- [ ] AC5: `POST /api/users/me/avatar` (multipart) returns 200 and updates the `avatarUrl` in the database.
- [ ] AC6: `GET /api/clients` returns 200 with a list of clients containing at least `id` and `name`.
- [ ] AC7: Unauthorized users (non-admins) receive 403 on admin-only endpoints.
- [ ] AC8: Unauthenticated users receive 401 on all user endpoints.

---

## Out of Scope
- Frontend UI implementation (this PRD covers backend API only).
- Multi-factor authentication (MFA) implementation.
- User deletion (soft or hard deletes).

---

## Open Questions
- [ ] Should `POST /users/me/avatar` store images locally or use an external cloud provider? (Default: local storage for MVP).
- [ ] Does `PATCH /users/me` require password verification for email changes? (Standard: yes for production, but we'll stick to the requested scope for now).
