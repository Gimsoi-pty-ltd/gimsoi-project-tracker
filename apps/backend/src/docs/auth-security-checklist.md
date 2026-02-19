# Sprint 1 Auth Security Checklist (DevOps-aligned)

## Secrets & Configuration
- [ ] No secrets committed to the repository.
- [ ] Secrets injected at runtime via environment variables.
- [ ] CI uses GitHub Secrets (no secrets printed in logs).
- [ ] Naming stays consistent (e.g., JWT_SECRET).
- [ ] `.env.example` exists with placeholders only.

---

## Token Rules (JWT)
- [ ] JWTs are short-lived (MVP-friendly).
- [ ] JWT signature and expiry verified on every protected request.
- [ ] JWT contains minimal claims only: `sub`, `email`, `role`.
- [ ] Backend never trusts frontend authorization checks.

---

## Logging Rules (Non-Negotiable)

Never log:
- [ ] tokens / JWTs
- [ ] secrets
- [ ] auth headers
- [ ] decoded token payloads
- [ ] passwords
- [ ] reset tokens

Allowed logs:
- [ ] request id
- [ ] route + status code
- [ ] sanitized error messages

---

## Password Security
- [ ] Passwords are hashed (bcrypt or equivalent).
- [ ] Plaintext passwords are never stored.
- [ ] Reset tokens expire.
- [ ] Auth errors remain generic (avoid user enumeration).

Example:

"Invalid credentials"  
"User not found"

---

## RBAC Enforcement
- [ ] RBAC checks exist on every protected route.
- [ ] Default deny: missing/invalid role → forbidden.
- [ ] Intern actions require ownership validation.
- [ ] Client role remains read-only.

---

## Performance Checks
- [ ] JWT verification does NOT require DB calls.
- [ ] RBAC checks run via middleware.
- [ ] Ownership checks use minimal queries.
- [ ] Pagination enforced on large list endpoints.

---

## Future Security Considerations (Not Sprint 1)

When OAuth providers are introduced:

- OAuth callback must accept only approved redirect URIs.
- Validate OAuth `state` parameter (CSRF protection).
- Code exchange must occur server-to-server.
- User identity should rely on provider subject ID.
