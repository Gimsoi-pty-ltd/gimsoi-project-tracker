# Security Baseline

## Purpose

This document defines the **minimum security controls enforced in this repository**.

These controls exist to:
- Protect client data
- Prevent secret leakage
- Enforce secure defaults
- Enable safe scaling as more teams and services are added

All rules in this document are **mandatory** and enforced via GitHub repository settings and CI where possible.

---

## Scope

This baseline applies to:
- All repositories managed by the DevOps/Infrastructure team
- All code merged via Pull Requests
- All CI workflows (GitHub Actions)
- All contributors (Dev, Frontend, Backend, Infra)

Runtime security (running applications, deployments, production secrets) is **out of scope for this sprint** and covered by future backlog items.

---

## Related Documents

This baseline is informed by the following documents:

- [Client Data Definition](./client-data-definition.md)  
  Defines what counts as client data and what must be protected.

- [Common Data Leak Scenarios](./common-data-leak-scenarios.md)  
  Describes realistic ways data and secrets can leak.

These documents explain **why** controls exist.  
This baseline defines **how controls are enforced**.

---

## Core Security Principles

1. **No secrets in source control**
2. **Secure-by-default CI**
3. **Least privilege everywhere**
4. **Fail fast, fail loud**
5. **Security is enforced, not optional**

---

## Repository Access & Protection Rules

### Branch Protection

- Direct commits to protected branches are **not allowed**
- All changes must be merged via Pull Request
- Force-push is disabled on protected branches

### Required Reviews

- At least one approved review is required
- Code owners must review changes affecting:
  - CI workflows
  - Security-related files
  - Shared configuration

### Required Status Checks

A PR **cannot be merged** unless:
- All required CI workflows pass
- Security checks complete successfully

---

## CI Security Rules

CI is treated as a **security boundary**.

### CI Must:

- Run automatically on every Pull Request
- Block merges on failure
- Mask secrets in logs
- Fail on detected secrets
- Fail on unsafe config patterns

### CI Must NOT:

- Contain hardcoded credentials
- Log environment variables
- Allow bypass of required checks

### CI Configuration Changes

- CI workflow files are protected
- Changes require review by DevOps/Infra
- Unauthorized changes are blocked

---

## Secret Handling Rules

### What Counts as a Secret

- API keys
- Tokens
- Passwords
- Certificates
- Encryption keys
- Credentials of any kind

If it grants access, it is a secret.

---

### Rules (Strict)

- Secrets **must never** be committed to git
- Secrets **must never** appear in:
  - Source code
  - Config files
  - CI logs
  - Frontend bundles
- `.env`, `.pem`, `.key`, `.crt` files are **not allowed**

GitHub Secrets are approved **for CI use only**.

---

### If a Secret Is Detected

If CI or review detects a secret:

1. The PR is **blocked**
2. The secret **must be removed**
3. The secret **must be rotated immediately**
4. The PR must be updated before merge

No exceptions.

---

## Configuration Standards

### Frontend Configuration (React)

- Frontend code **cannot contain secrets**
- All frontend config is public by default
- `REACT_APP_*` variables are **not secrets**

Allowed:

REACT_APP_API_BASE_URL

Not allowed:

REACT_APP_API_KEY
REACT_APP_SECRET

Frontend must obtain sensitive data via backend APIs.

### Backend Configuration

- Use placeholder values only
- No real credentials committed
- Runtime secrets will be injected later

---

## Logging Rules

### Logging must not include

- Secrets or credentials
- Environment variables
- Client data
- Full request or response bodies
- Authorisation headers

### Logging should

- Be minimal
- Be structured
- Avoid sensitive context

Logs are treated as public artifacts.

---

## Folder Structure Enforcement

### CI expects a predictable structure

frontend/
backend/

### Rules

- Code must be placed in the correct folder
- Folder names must not be changed
- Nested applications are not allowed without approval

Incorrect structure will block CI.

---

## Runtime Security (In the future)

### The following are intentionally deferred

- Runtime secrets management
- Deployment-time credentials
- Production access controls
- Runtime monitoring and alerting

These are tracked as backlog items and will extend this baseline in future sprints.

---

## Ownership and Enforcement

### Owners

- DevOps/Infrastructure team owns this baseline
- Changes require review and approval

### Enforcement

- CI enforces rules automatically
- Reviews enforce what CI cannot
- Violations are blocked, not warned

---

## Summary

- If it's not allowed here, CI will block it
- If CI blocks it, it's intentional
- This baseline protects client data by design
- Security is part of the platform, not an afterthought