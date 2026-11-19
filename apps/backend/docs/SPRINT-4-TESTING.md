# Sprint 4 Backend API Testing and OpenAPI Documentation

**Date:** 2026-11-19  
**Component:** Project Health API, Workload Management API, Notification API, and OpenAPI/Swagger Documentation  
**Test scope:** Health calculations, workload calculations, employee focus tasks, project progress, analytics authorization, notification CRUD behavior, role-based access, project ownership, validation, error handling, and OpenAPI specification verification  
**Status:** Passed

## Purpose

This document records the backend commands, terminal results, and OpenAPI/Swagger documentation updates for the Sprint 4 Project Health, Workload, and Notification APIs.

Testing was performed on the dedicated test database, followed by updating the backend OpenAPI documentation to reflect the actual verified endpoints, calculations, schemas, authentication, and RBAC rules.


## Prerequisites

From `apps/backend`, verify that:

- Node.js and npm are installed.
- A separate `.env.test` database is configured.
- `.env.test` has a `DATABASE_URL` that is different from the development database.
- The test database is not used for development or production data.

The test setup requires this safety separation because Playwright truncates the configured test database before each run.

## Prepare the Test Database

Synchronize the dedicated test database with the current Prisma schema:

```powershell
cd C:\Users\sello\Desktop\gimsoi\gimsoi-project-tracker\apps\backend
node -e "require('dotenv').config({path:'./.env.test',override:true,quiet:true}); require('child_process').execSync('npx prisma db push',{stdio:'inherit'})"
```

### Terminal Result

```text
Loaded Prisma config from prisma.config.ts.
Prisma schema loaded from prisma\schema.prisma.
Datasource "db": PostgreSQL database "postgres", schema "public" at "db.prisma.io:5432"

Your database is now in sync with your Prisma schema.
Done in 19.59s
```

The test database is also initialized again automatically by the Playwright global setup before the test run.

## Run the Focused Health and Workload Tests

Before the broader regression run, the Project Health and Workload suites were run separately:

```powershell
cd C:\Users\sello\Desktop\gimsoi\gimsoi-project-tracker\apps\backend
npx playwright test tests/api/health-score.spec.js tests/api/workload.spec.js tests/api/workload-focus.spec.js --workers=1
```

### Terminal Result

```text
Running 19 tests using 1 worker

ok  1 tests\api\health-score.spec.js
ok  2 tests\api\health-score.spec.js
ok  3 tests\api\workload-focus.spec.js
ok  4 tests\api\workload-focus.spec.js
ok  5 tests\api\workload-focus.spec.js
ok  6 tests\api\workload-focus.spec.js
ok  7 tests\api\workload-focus.spec.js
ok  8 tests\api\workload-focus.spec.js
ok  9 tests\api\workload-focus.spec.js
ok 10 tests\api\workload-focus.spec.js
ok 11 tests\api\workload-focus.spec.js
ok 12 tests\api\workload-focus.spec.js
ok 13 tests\api\workload-focus.spec.js
ok 14 tests\api\workload.spec.js
ok 15 tests\api\workload.spec.js
ok 16 tests\api\workload.spec.js
ok 17 tests\api\workload.spec.js
ok 18 tests\api\workload.spec.js
ok 19 tests\api\workload.spec.js

19 passed (2.4m)
```

Result: **19 passed, 0 failed**.

## Run the Sprint 4 and Related Regression Suite

The consolidated run covered Project Health, Workload, Analytics, Projects, Phases, and RBAC:

```powershell
cd C:\Users\sello\Desktop\gimsoi\gimsoi-project-tracker\apps\backend
npx playwright test tests/api/health-score.spec.js tests/api/workload.spec.js tests/api/workload-focus.spec.js tests/api/analytics.spec.js tests/api/projects.spec.js tests/api/phases-milestones.spec.js tests/api/rbac.spec.js --workers=1
```

### Terminal Result

```text
--- Playwright Global Setup: Initializing clean test environment ---
--- Test environment initialized via TRUNCATE ---
Running 67 tests using 1 worker

67 passed (8.6m)
```

Result: **67 passed, 0 failed**.

## Notification API Test

The notification routes had no existing Playwright test file. They were tested directly against port `5002`, using the dedicated test database and two authenticated test users.

The test server was started with the dedicated test database:

```powershell
cd C:\Users\sello\Desktop\gimsoi\gimsoi-project-tracker\apps\backend
node -e "import('dotenv').then(async ({ default: d }) => { d.config({ path:'./.env.test', override:true, quiet:true }); process.env.NODE_ENV='test'; process.env.PORT='5002'; await import('./server.js') })"
```

### Terminal Server Result

```text
[api/testing] registered
[db] Connected.
[server] Running on port 5002
```

The integration check exercised:

- `GET /api/notifications` without authentication
- `GET /api/notifications` for an authenticated user
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`
- Notification isolation between two users
- Marking an unknown notification as read

### Terminal Result

```json
{
  "unauth": {
    "status": 401,
    "body": {
      "success": false,
      "message": "Unauthorized - no token provided"
    }
  },
  "list": {
    "status": 200,
    "count": 2,
    "otherUserVisible": false
  },
  "markOne": {
    "status": 200,
    "body": {
      "success": true,
      "message": "Marked as read"
    }
  },
  "unknown": {
    "status": 404,
    "body": {
      "success": false,
      "message": "Notification not found"
    }
  },
  "markAll": {
    "status": 200,
    "body": {
      "success": true,
      "message": "All notifications marked as read"
    }
  },
  "final": {
    "status": 200,
    "unreadCount": 0,
    "readCount": 2
  }
}
```

Notification test result: **6 checks passed, 0 failed**.

### Notification Coverage

- Unauthenticated list requests are rejected with `401`
- Authenticated users can list notifications
- The list is limited to notifications owned by the authenticated user
- A specific notification can be marked as read
- Unknown or non-owned notification IDs return `404`
- All notifications for the authenticated user can be marked as read
- No unread notifications remain after the mark-all operation

## Test Areas Verified

### Project Health

- Project health score based on task completion
- Blocked-task penalties
- Overdue-task penalties
- Phase health score
- Project progress response shape
- Project and milestone edge cases
- PM and ADMIN project health access
- Unknown project handling

### Workload Management

- ADMIN workload
- PM workload
- INTERN workload
- Employee with no assigned tasks
- Unauthenticated workload rejection
- CLIENT workload rejection
- Active, completed, overdue, and blocked task counts
- Active story points
- Tasks with null story points
- Priority ordering of Focus Today tasks
- Due-today and upcoming-task selection
- Five-task focus-card limit
- Deleted task exclusion
- Deleted project exclusion
- Tasks only for the authenticated employee

### Authorization and Validation

- Unauthenticated requests return `401`
- Restricted roles return `403`
- PM access is limited to authorized projects
- ADMIN access applies across projects
- Unknown project health requests are handled
- Project and task ownership rules are enforced
- Project create/update validation returns `400` for invalid input

### Notifications

- Authentication is required to list notifications
- Mark-one and mark-all operations require authentication
- Notifications are isolated by `userId`
- Unknown notification IDs return `404`

## Individual Test Commands

Run only the Workload tests:

```powershell
npx playwright test tests/api/workload.spec.js tests/api/workload-focus.spec.js --workers=1
```

Run only the Project Health tests:

```powershell
npx playwright test tests/api/health-score.spec.js tests/api/analytics.spec.js --workers=1
```

Run one test file:

```powershell
npx playwright test tests/api/workload-focus.spec.js --workers=1
```

Run the complete configured API suite:

```powershell
npm run test:api
```

## How to Interpret Results

- `ok` indicates that the Playwright test passed.
- A failed test prints the expected value, received value, and assertion location.
- The final summary provides the total passed and failed test count.
- Detailed Playwright evidence is stored under:

```text
apps/backend/test-results/
```

## Terminal Warnings

The test runs displayed warnings about PostgreSQL SSL alias behavior:

```text
SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca'
are treated as aliases for 'verify-full'.
```

These warnings did not cause test failures.

## Outstanding Defects

No outstanding defects were found in the 67-test Sprint 4 regression run or the 6 Notification API integration checks.

## Swagger / OpenAPI Documentation Updates

Following API and regression verification, the backend Swagger/OpenAPI documentation was updated to fully document Sprint 4 endpoints and accurately represent the Gimsoi Project Tracker backend.

### 1. Modified Files

- **`lib/swagger.js`**: Updated API title to `"Gimsoi Project Tracker API"`, added comprehensive system description, declared `bearerAuth` and `cookieAuth` security schemes, set default server prefix (`/api`), and expanded route scan files to include `health.route.js`, `analytics.route.js`, `notification.route.js`, `employee.route.js`, and `project.route.js`.
- **`routes/analytics.route.js`**: Added OpenAPI annotations for `GET /api/analytics/project-health/{projectId}`, documenting PM ownership rules (404 mask on other PMs' projects), ADMIN global access, role restrictions (`requireAnyRole(['ADMIN', 'PM'])`), pending vs synced `ProjectAnalytics` response structures, and error schemas.
- **`routes/project.route.js`**: Added OpenAPI annotations for `GET /api/projects/{id}/health`, documenting completion rate calculation (`Math.round((DONE / totalTasks) * 100)`), RAG thresholds (`GREEN >= 80%`, `AMBER 50-79%`, `RED < 50%`), `VIEW_PROJECTS` permission requirement, and 200/401/403/404 responses.
- **`routes/employee.route.js`**: Added OpenAPI annotations for `GET /api/employees/me/workload`, documenting role permissions (`ADMIN`, `PM`, `INTERN`; `CLIENT` forbidden), South African timezone handling (`Africa/Johannesburg`), workload metrics (`activeTasks`, `completedTasks`, `overdueTasks`, `blockedTasks`, `activeStoryPoints`), Focus Today selection rules (`DUE_TODAY`, `UP_NEXT`, `EMPTY` capped at 5 tasks, priority ordering `URGENT` > `HIGH` > `MEDIUM` > `LOW`), and soft-deletion exclusions.
- **`routes/notification.route.js`**: Added OpenAPI annotations for `GET /api/notifications` (up to 50 user notifications), `PATCH /api/notifications/read-all` (mark all unread as read), and `PATCH /api/notifications/{id}/read` (mark one as read, 404 for unknown/unowned), complete with 60 req/min rate limit documentation and response schemas.

### 2. Specification Verification Results

The generated OpenAPI specification was verified using a standalone Express runner:

```powershell
cd C:\Users\sello\Desktop\gimsoi\gimsoi-project-tracker\apps\backend
node -e "
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './lib/swagger.js';

const app = express();
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

const server = app.listen(5099, async () => {
  const resDocs = await fetch('http://127.0.0.1:5099/api/docs/');
  const resJson = await fetch('http://127.0.0.1:5099/api/docs.json');
  const json = await resJson.json();
  console.log('Docs status:', resDocs.status);
  console.log('JSON status:', resJson.status);
  console.log('JSON title:', json.info.title);
  console.log('Endpoints count:', Object.keys(json.paths).length);
  console.log('Endpoints:', Object.keys(json.paths));
  server.close();
});
"
```

#### Terminal Result

```text
Docs status: 200
JSON status: 200
JSON title: Gimsoi Project Tracker API
Endpoints count: 7
Endpoints: [
  '/api/health',
  '/api/analytics/project-health/{projectId}',
  '/api/notifications',
  '/api/notifications/read-all',
  '/api/notifications/{id}/read',
  '/api/employees/me/workload',
  '/api/projects/{id}/health'
]
```

### 3. Implementation Gap Finding

- **Workload Controller Route Connection:** `getMyWorkloadController` is mounted under `GET /api/employees/me/workload` in `routes/employee.route.js`. No separate `routes/workload.route.js` exists or is mounted under `/api/workload` on `server.js`. The endpoint was accurately documented under its real mounted route path without inventing unmounted `/api/workload/*` routes.

