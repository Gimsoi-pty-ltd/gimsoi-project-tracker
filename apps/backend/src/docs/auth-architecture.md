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

