# Sprint 1 Auth Architecture (Google OAuth + RBAC)

## Goal
- Users can log in with Google.
- Backend issues its own short-lived JWT for API access.
- Backend enforces Role-Based Access Control (RBAC) for protected routes.

## Roles (MVP)
- Admin: full internal access
- PM: manage projects/tasks for their projects
- Intern: update assigned tasks only
- Client: read-only progress visibility

## High-level flow
1. Frontend starts login by hitting `/api/auth/google` (redirect to Google).
2. Google sends the user back to `/api/auth/google/callback` with an auth code.
3. Backend exchanges the code for Google tokens (server-side).
4. Backend fetches Google profile details (email + Google subject id).
5. Backend upserts the user in the database and assigns a role.
6. Backend issues an app JWT (short expiry) and returns it to the frontend.
7. Frontend sends JWT on every request using `Authorization: Bearer <token>`.
8. Backend verifies JWT on each request and enforces RBAC.

## Sprint 1 Endpoints (Auth)
- GET `/api/auth/google`
  - starts the OAuth redirect
- GET `/api/auth/google/callback`
  - handles code exchange -> profile -> user upsert -> JWT issuance
- GET `/api/auth/me`
  - returns current user context from JWT (id, email, role)
- POST `/api/auth/logout` (optional)
  - client-side logout; server-side revocation can be added later

## Backend enforcement points
### Authentication
- `authenticateJWT` middleware:
  - validates `Authorization: Bearer <token>`
  - verifies JWT signature + expiry
  - attaches `req.user = { id, email, role }`

### Authorization (RBAC)
- `requireAnyRole(["Admin","PM"])` for privileged routes
- ownership-based checks for intern actions (e.g., update own tasks)
- default deny:
  - missing/invalid role -> forbidden

## Data model expectations
Minimum user identity fields to support OAuth:
- stable external identifier: `google_sub` (Google subject ID)
- email (not used as primary identifier, because email can change)
- role (Admin/PM/Intern/Client)
- timestamps

## Non-goals for Sprint 1
- refresh tokens
- multi-environment dev/staging/prod separation (single non-prod for Sprint 1)
- advanced permission graphs (fine-grained permissions table can come later)
