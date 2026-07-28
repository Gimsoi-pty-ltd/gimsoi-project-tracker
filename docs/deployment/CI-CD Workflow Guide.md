# CI/CD Workflow Guide

**Project:** Project Tracker  
**Organisation:** Gimsoi (Pty) Ltd.  
**Owner:** DevOps & Infrastructure Team  
**Version:** 1.0

---

# 1. Purpose

This document describes the Continuous Integration (CI) and deployment workflows implemented using GitHub Actions.

The objectives are to:

- Ensure every code change is validated.
- Detect issues before deployment.
- Maintain software quality.
- Support reliable deployments.
- Provide troubleshooting guidance.

---

# 2. Current Workflow Architecture

```

Developer Push
│
▼
GitHub Repository
│
▼
ci.yml
│
├───────────────┐
│               │
▼               ▼
auth-tests.yml  codeql.yml
│               │
└──────┬────────┘
▼
QA Review & Approval
▼
Merge to Main
▼
deploy.yml (Manual Deployment Currently Used)

```

---

# 3. Workflow Summary

| Workflow | Purpose | Status |
|-----------|---------|--------|
| ci.yml | Build validation and Continuous Integration | Operational |
| auth-tests.yml | Authentication testing | Operational |
| codeql.yml | Security scanning | Operational |
| deploy.yml | Deployment automation | In Progress |

---

# 4. ci.yml

## Purpose

Validates application changes before integration.

## Trigger

- Push
- Pull Request

## Responsibilities

- Checkout repository
- Install backend dependencies
- Install frontend dependencies
- Generate Prisma Client
- Build React application
- Validate backend build
- Verify workflow completion

## Expected Outcome

Successful CI completion before review.

---

# 5. auth-tests.yml

## Purpose

Validates authentication functionality.

## Trigger

After code changes affecting authentication.

## Responsibilities

- Execute authentication tests
- Verify login
- Verify authentication endpoints
- Detect authentication regressions

## Expected Outcome

Authentication remains functional.

---

# 6. codeql.yml

## Purpose

Performs automated security analysis.

## Trigger

- Push
- Pull Request
- Scheduled security scans

## Responsibilities

- Static code analysis
- Detect security vulnerabilities
- Detect insecure coding patterns
- Produce security reports

## Expected Outcome

No critical CodeQL findings.

---

# 7. deploy.yml

## Purpose

Automates deployment to Zoho Catalyst.

## Current Status

Deployment workflow is configured but remains under validation.

Manual deployment is currently the approved deployment method.

## Planned Responsibilities

- Build frontend
- Install Catalyst CLI
- Authenticate with Catalyst
- Deploy Client
- Deploy AppSail
- Verify deployment

---

# 8. Workflow Execution Order

1. Developer pushes code
2. ci.yml executes
3. auth-tests.yml executes
4. codeql.yml executes
5. QA reviews changes
6. QA approval
7. Merge to main
8. Manual deployment
9. Automated deployment (future)

---

# 9. Troubleshooting

## CI Failure

Possible causes

- Dependency installation failure
- Build failure
- Missing environment variables
- Prisma generation failure

Actions

- Review GitHub Actions logs
- Fix build errors
- Re-run workflow

---

## Authentication Failure

Possible causes

- API changes
- Authentication configuration
- Environment variables

Actions

- Review auth logs
- Validate authentication endpoints

---

## CodeQL Failure

Possible causes

- Vulnerable dependency
- Security issue

Actions

- Review findings
- Implement remediation
- Re-run workflow

---

## Deployment Failure

Possible causes

- Catalyst authentication
- CLI issues
- Build artifacts
- Environment configuration

Actions

- Review deployment logs
- Validate Catalyst configuration
- Perform manual deployment if required

---

# 10. Future Improvements

- Fully automated deployment
- Deployment notifications
- Workflow dashboards
- Deployment metrics
- Automated rollback