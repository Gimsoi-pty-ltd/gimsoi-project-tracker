# Backend Authentication Architecture (Sprint 1)

## Goal
Provide secure authentication and role-based access control (RBAC) across the backend.

The system currently supports email/password authentication with JWT-based authorization.

Future OAuth providers (e.g., Google) can be layered onto this architecture without major changes.

---

## Authentication Strategy

We use **JWT (JSON Web Tokens)** for stateless authentication.

### Flow

1. User signs up via `/api/auth/signup`
2. User logs in via `/api/auth/login`
3. Backend validates credentials
4. Backend issues a JWT
5. Frontend sends JWT on each request:
6.  `verifyToken` middleware:
- validates signature
- checks expiry
- attaches `req.user`

---

## Current Auth Routes

### Public Routes
- POST `/api/auth/signup`
- POST `/api/auth/login`
- POST `/api/auth/verify-email`
- POST `/api/auth/forgot-password`
- POST `/api/auth/reset-password/:token`

### Protected Routes
- GET `/api/auth/check-auth`
  - Requires valid JWT

---

## Authorization (RBAC)

After authentication, access is controlled by user roles.

### MVP Roles
- Admin → full system access
- PM → manage projects and tasks
- Intern → update assigned work only
- Client → read-only visibility

---

## Middleware Layers

### Authentication
**verifyToken**
- Extract JWT
- Validate token
- Attach user to request

### Authorization
**RBAC middleware**
- Enforces role permissions
- Blocks unauthorized actions
- Default behavior = deny access

Example:

```js
router.post(
  "/tasks",
  verifyToken,
  requireAnyRole(["Admin", "PM"]),
  createTask
);


