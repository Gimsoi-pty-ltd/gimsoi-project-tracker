# Deployment Operations Guide

**Project:** Project Tracker   
**Owner:** DevOps & Infrastructure Team  
**Document Version:** 1.0  
**Status:** Development Phase

---

# 1. Purpose

This document defines the standard deployment procedures for the Project Tracker application.

It serves as the operational guide for:

- Manual deployments
- Deployment validation
- GitHub workflow execution
- Environment management
- Rollback procedures
- Operational support

The objective is to ensure deployments are repeatable, documented and not dependent on individual team members.

---

# 2. Current Deployment Status

The project is currently in the **Flaw Discovery, Gap Identification and Remediation Phase**.

Current deployment status:

- Manual deployment is operational.
- Automated deployment workflow (deploy.yml) has been implemented but is still undergoing validation and refinement.
- CI workflows are functioning correctly.
- Deployment automation will only be enabled once all identified gaps have been resolved and validated.

---

# 3. Solution Architecture

```
Developer
      │
      ▼
GitHub Repository
      │
      ▼
GitHub Actions
(CI Validation)
      │
      ▼
QA Review & Approval
      │
      ▼
Merge to Main
      │
      ▼
Manual Deployment
      │
      ▼
──────────────────────────────
Catalyst Client
(React Frontend)

Catalyst AppSail
(Node.js Backend)
──────────────────────────────
```

---

# 4. Platform Overview

## Frontend

Technology:

- React
- Vite

Deployment Platform:

- Zoho Catalyst Client

Purpose:

Hosts the user interface of the application.

---

## Backend

Technology:

- Node.js
- Express
- Prisma ORM

Deployment Platform:

- Zoho Catalyst AppSail

Purpose:

Hosts APIs, authentication, business logic and database access.

---

## Source Control

Platform:

- GitHub

Purpose:

- Source code management
- Branch management
- Pull Requests
- Code reviews

---

## CI/CD

Platform:

- GitHub Actions

Purpose:

- Continuous Integration
- Security validation
- Automated testing
- Deployment execution

---

# 5. Branch Strategy

| Branch | Purpose |
|---------|---------|
| main | Stable integration branch |
| testing | Deployment validation, QA testing and infrastructure testing |
| feature/* | Feature development |

---

# 6. GitHub Actions Workflows

## CI Workflow (ci.yml)

Purpose

Validates every code change.

Responsibilities

- Install dependencies
- Generate Prisma Client
- Build frontend
- Validate backend
- Run automated checks

Status

✅ Operational

---

## Authentication Tests (auth-tests.yml)

Purpose

Validates authentication functionality.

Responsibilities

- Authentication API testing
- Login validation
- Authentication regression testing

Status

✅ Operational

---

## CodeQL (codeql.yml)

Purpose

Performs security analysis.

Responsibilities

- Static code analysis
- Security vulnerability detection
- Code scanning

Status

✅ Operational

---

## Deployment Workflow (deploy.yml)

Purpose

Deploys application to Zoho Catalyst.

Responsibilities

- Install Catalyst CLI
- Build frontend
- Deploy frontend
- Deploy backend

Status

🟡 Configured

Currently undergoing validation before automated deployment is enabled.

---

# 7. Deployment Prerequisites

Before deployment ensure:

- Latest changes have been pulled.
- CI pipeline has completed successfully.
- No outstanding merge conflicts.
- Environment variables are configured.
- Backend builds successfully.
- Frontend builds successfully.
- Prisma schema is synchronized with the development database.
- Deployment approval has been obtained (where applicable).

---

# 8. Manual Deployment Procedure

## Step 1

Switch to the latest branch.

```bash
git checkout testing
```

or

```bash
git checkout main
```

depending on the deployment target.

---

## Step 2

Pull latest changes.

```bash
git pull origin testing
```

or

```bash
git pull origin main
```

---

## Step 3

Install dependencies.

Backend

```bash
cd apps/backend
npm install
```

Frontend

```bash
cd apps/frontend
npm install
```

---

## Step 4

Generate Prisma Client.

```bash
npx prisma generate
```

---

## Step 5

Build frontend.

```bash
npm run build
```

---

## Step 6

Deploy Frontend.

```bash
catalyst deploy --only client
```

---

## Step 7

Deploy Backend.

```bash
catalyst deploy --only appsail
```

---

## Step 8

Confirm deployment completed successfully.

---

# 9. Post-Deployment Validation

Verify:

Frontend

- Homepage loads
- Assets load correctly
- No browser console errors

Backend

- Backend starts successfully
- API endpoints respond
- Authentication functions correctly
- Prisma connects successfully

Application

- Login
- Dashboard
- Task management
- Sprint management
- Project management

---

# 10. Operational Monitoring

Following deployment, verify:

- Backend availability
- Frontend accessibility
- Deployment logs
- Build status
- Runtime logs
- Application health

---

# 11. Incident Response

Common deployment issues include:

- Deployment failure
- Build failure
- Environment variable errors
- Authentication failures
- Backend startup failures
- Database connectivity issues
- Prisma migration issues

---

## Resolution Process

1. Identify the failure.

2. Review GitHub Actions logs.

3. Review Catalyst deployment logs.

4. Review backend runtime logs.

5. Identify root cause.

6. Implement corrective action.

7. Redeploy.

8. Revalidate.

---

# 12. Rollback Procedure

If deployment validation fails:

1. Identify the last known stable commit.

2. Checkout that commit or revert the deployment commit.

3. Redeploy the frontend.

4. Redeploy the backend.

5. Verify application functionality.

6. Notify QA that rollback has completed.

---

# 13. Environment Configuration

Sensitive configuration is managed using:

- GitHub Secrets
- Catalyst Environment Variables
- Local .env files (development only)

Sensitive information must never be committed to source control.

---

# 14. Security Practices

Deployment security includes:

- Protected GitHub repository
- Pull Request reviews
- Branch protection rules
- GitHub Secrets
- Environment variables
- CodeQL security scanning
- Principle of least privilege for deployment access

---

# 15. Known Limitations

Current limitations include:

- Deployment automation is still under validation.
- Manual deployment is currently the approved deployment method.
- Migration inconsistencies must be resolved before automated deployment can be fully validated.
- Continuous improvement activities are ongoing as part of the remediation phase.

---

# 16. Future Improvements

Planned enhancements:

- Complete deployment workflow validation
- Enable fully automated deployment
- Deployment versioning
- Automated rollback strategy
- Deployment notifications
- Enhanced monitoring and alerting
- Deployment metrics dashboard

---

# 17. Responsibilities

## DevOps & Infrastructure

- Deployment management
- CI/CD maintenance
- Environment setup
- Infrastructure management
- Deployment validation
- Operational documentation

---

## Development Team

- Feature implementation
- Bug fixes
- Pull Requests
- Code reviews

---

## QA Team

- Functional testing
- Deployment validation
- Regression testing
- Release approval

---

# 18. Document Control

This guide shall be reviewed whenever:

- Deployment architecture changes.
- CI/CD workflows change.
- Catalyst deployment process changes.
- New environments are introduced.
- Security procedures are updated.