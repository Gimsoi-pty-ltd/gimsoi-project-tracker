# Catalyst Deployment Guide

**Project:** Project Tracker  
**Owner:** DevOps & Infrastructure Team

---

# 1. Purpose

This guide documents the deployment process for the Project Tracker application hosted on Zoho Catalyst.

---

# 2. Deployment Architecture

React Frontend

↓

Catalyst Client

↓

Node.js Backend

↓

Catalyst AppSail

---

# 3. Deployment Prerequisites

Before deployment ensure:

- Latest code has been pulled.
- CI workflows have passed.
- Backend builds successfully.
- Frontend builds successfully.
- Prisma Client generated.
- Environment variables configured.
- Catalyst CLI installed.
- Catalyst authentication completed.

---

# 4. Catalyst CLI

Verify installation

```bash
catalyst --version
```

Login

```bash
catalyst login
```

---

# 5. Frontend Deployment

Navigate to project root

```bash
npm run build
```

Deploy

```bash
catalyst deploy --only client
```

Expected Result

- Deployment successful
- Frontend URL updated

---

# 6. Backend Deployment

Deploy AppSail

```bash
catalyst deploy --only appsail
```

Expected Result

- Backend running
- APIs accessible

---

# 7. Deployment Validation

Verify:

Frontend

- Loads successfully
- Assets load correctly

Backend

- Starts successfully
- API available

Authentication

- Login works
- Registration works

Application

- Dashboard
- Projects
- Tasks
- Sprints

---

# 8. Common Deployment Issues

## Build Failure

Check

```bash
npm install
npm run build
```

---

## Prisma Issues

Check

```bash
npx prisma generate
```

---

## Environment Variables

Verify:

- DATABASE_URL
- JWT_SECRET
- SMTP settings
- Catalyst variables

---

## Authentication Failure

Verify:

Backend running

API endpoints

JWT configuration

---

# 9. Operational Checklist

Before deployment

☐ Latest code

☐ Successful build

☐ Environment variables

☐ CI completed

After deployment

☐ Frontend accessible

☐ Backend accessible

☐ Login works

☐ APIs operational

☐ Logs checked