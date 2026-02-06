# Client Data Definition

## Purpose
This document defines what counts as **client data**, what would be catastrophic if leaked,
and how this classification informs enforcement in CI and repository controls.

---

## How This Document Is Used

This document informs:
- CI security rules
- Secret handling enforcement
- Logging restrictions

See:
- [Security Baseline](./SECURITY_BASELINE.md) for enforced controls
- [Common Data Leak Scenarios](./common-data-leak-scenarios.md) for realistic risks

---

## What Counts as Client Data

Client data includes **any data originating from or related to a customer or client system**,
whether real, derived, or copied.

### Client data includes:

#### Identifying Information
- Names, email addresses, usernames
- Account IDs, tenant IDs
- Organization or customer identifiers

#### Authentication & Authorization Data
- API keys and access tokens
- OAuth secrets
- Session tokens
- JWTs (raw or decoded)

#### Business & Usage Data
- Dashboards and reports
- Usage metrics tied to a client
- Feature flags or entitlements

#### Technical Client Data
- API request and response payloads
- Headers containing identifiers or auth data
- Client-specific configuration values

---

## What Would Be Catastrophic if Leaked

The following are considered **high-impact leaks**:
- Credentials granting access to client systems or environments
- Raw client data in logs, CI output, or test fixtures
- Configuration exposing internal services or private endpoints

Such leaks may result in security incidents, loss of trust, or regulatory impact.

---

## How Client Data Could Leak Accidentally

Common accidental leak vectors include:
- Committed `.env` or config files
- Hardcoded secrets or URLs
- Verbose logging of:
  - Config objects
  - API responses
  - Environment variables
- CI logs and artifacts
- Test data copied from real systems

Accidental leaks are more common than malicious ones.

---

## How Code Enters the Repository

- All code enters via Pull Requests
- Code may originate from:
  - Separate team-owned repositories
  - Local development environments
- CI runs automatically on every PR

Incoming code may already contain unsafe patterns and must be validated.

---

## Environments That Will Exist

Expected environments:
- `development`
- `staging`
- `production`

Rules:
- Production client data must never appear outside production
- CI must never contain real client data
- Frontend code must treat all configuration as public

---

## Enforcement Link

Any data classified here as client data must be handled according to the
[Security Baseline](./SECURITY_BASELINE.md).

---

## Ownership
This document is maintained by the DevOps / Infrastructure team and reviewed periodically.