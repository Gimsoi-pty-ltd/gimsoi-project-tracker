# How to Onboard a New Service

This document explains exactly how to add a new service to this repository and what is required for your Pull Request (PR) to be accepted.


## Purpose
This document explains how to onboard a new service into this repository
and what requirements must be met for a successful merge.

It is written for application developers and assumes no prior knowledge of
our CI or security enforcement.

This repository enforces secure-by-default CI and repository controls.

### The onboarding process exists to

- Prevent accidental data and secret leaks
- Enforece consistent project structure
- Make CI behaviour predictable
- Protect client data from the beginning 

Security rules are enforced automatically. They are not optional. 

---

## Before You Start (Required Reading)

Before opening a PR, you **must** review:
- [Security Baseline](./SECURITY_BASELINE.md)
- [Client Data Definition](./client-data-definitions.md)
- [Common Data Leak Scenarios](./common-data-leak-scenarios.md)

These documents explain what is protected, why it matters, and how enforcement works.

---

## Supported Service Types

Currently supported:
- Frontend services (React / JavaScript)
- Backend services (Node.js or similar)

Runtime secrets, deployments, and production integrations are out of scope for now.

---

## Required Repository Structure

**CI relies on fixed folder paths. It does not auto-discover services.**

You must place your service in one of the following directories:

frontend/
backend/

### Frontend services

Your React app must live directly under `frontend/`


Requirements:
- `package.json` must be at `frontend/package.json`
- No additional nesting without DevOps approval

---

### Backend services

Backend services must live directly under `backend/`.

Requirements:
- Service root must be `backend/`
- No nested services without approval

---

## Why This Structure Exists

- CI workflows use fixed paths
- Security scans depend on predictable locations
- Prevents accidental bypass of checks

Do not rename or restructure these folders.

---

## Step-by-Step: Onboarding a New Service

### 1. Prepare Your Code Before Merging

Before opening a PR:
- Remove all secrets and real credentials
- Replace real config values with placeholders
- Ensure no `.env` files contain real values
- Ensure frontend config assumes all values are public

> CI will not “fix this for you” — unsafe code will be blocked.

---

### 2. Configuration Setup

#### Required
- Use **environment variables** for configuration
- Provide example files only:
  - `.env.example`
  - `config.example.yaml`
- Use fake or placeholder values

#### Forbidden
- Real values in config files
- Hardcoded URLs, tokens, or credentials
- Production values in development configs

---

### 3. Logging Expectations

Your service must:
- Avoid logging:
  - Environment variables
  - Full config objects
  - API responses containing data
- Use redaction where needed
- Treat logs as visible to the whole organization

If you are unsure whether something is safe to log — **do not log it**.

---

### 4. CI & PR Expectations

When you open a PR:
- CI will run automatically
- Security checks are mandatory
- At least one reviewer approval is required

You cannot merge until:
- All CI checks pass
- All review comments are resolved

---

### 5. Frontend-Specific Rules 

If your service includes frontend code:
- Treat **all frontend configuration as public**
- Frontend code must never contain secrets.
  - This includes:
    - API keys
    - Tokens
    - Credentials
    - Client secrets

- Never store secrets in:
  - `process.env.REACT_APP_*`
  - Build-time variables
- Remove `console.log` statements that output config or data

Frontend must obtain sensitive data via backend APIs.

---

### 6. Backend-Specific Rules

- Use placeholder values only
- No .env files committed
- No credentials in code
- Runtime secrets will be injected in a future sprint

---

### 7. Logging Rules

Do not log:
- Environment variables
- Secrets or credntials
- Client data
- Full request/response bodies
- Authorisation headers

Logs are treated as public artifacts.

---

## What Will Block Your PR (And How to Fix It)

This section lists **common PR blockers**, why they happen, and how to resolve them.

---

### Secrets Detected

**What happened**
- A secret, token, or credential was found in code, config, or history

**Why it’s blocked**
- Secrets in git are a critical security risk

**How to fix**
1. Remove the secret from all files
2. Replace with an environment variable reference
3. Rotate the exposed secret immediately
4. Push a new commit and re-run CI

---

### `.env` or Sensitive Files Committed

**What happened**
- `.env`, `.pem`, `.key`, `.p12`, or similar files were committed

**Why it’s blocked**
- These files often contain secrets and must never be in git

**How to fix**
1. Delete the file from the repo
2. Add an example version (e.g. `.env.example`)
3. Ensure `.gitignore` includes the real file

---

### Unsafe Configuration Patterns

**What happened**
- Hardcoded URLs, credentials, or environment-specific values were detected

**Why it’s blocked**
- Configuration must be injected, not embedded

**How to fix**
1. Replace hardcoded values with environment variables
2. Update example config files with placeholders
3. Document required variables in README or `.env.example`

---

### Logging Sensitive Data

**What happened**
- Logs include config objects, env vars, or data payloads

**Why it’s blocked**
- Logs are accessible and must not contain sensitive data

**How to fix**
1. Remove unsafe logging
2. Replace with redacted or minimal logs
3. Re-run CI

---

### CI Checks Failing

**What happened**
- Build, lint, or security checks failed

**Why it’s blocked**
- All checks are mandatory and enforced

**How to fix**
1. Review CI output in the PR
2. Fix reported issues
3. Push updates until CI passes

---

### Missing Reviews or Unresolved Comments

**What happened**
- Required approvals are missing
- Review comments are unresolved

**Why it’s blocked**
- Human review is mandatory for quality and security

**How to fix**
1. Address all comments
2. Request re-review
3. Wait for approval

---

## Pull Request Requirements

Your PR must:
- Be opened against the proteted branch
- Pass all required CI checks
- Receive required reviews
- Follow this onboarding guide

Direct merges, force pushes, and bypassing CI are not allowed.

---

## Key Principle

> CI enforces rules automatically.  
> If your PR is blocked, the fix is always to **change the code**, not bypass the system.

---

## Ownership
This document is maintained by the DevOps / Infrastructure team and updated as onboarding rules evolve.

---

## Summary

- CI expects strict folder structure
- Frontend code is always public
- Secrets are never allowed in code
- CI failures are intentional guardrails
- These rules exist to protect client data