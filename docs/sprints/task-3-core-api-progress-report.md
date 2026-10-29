# Task 3 — Core API Endpoints

## Progress Report

**Project:** GimSoi Project Tracker  
**Assigned role:** Member 3  
**Status:** In Progress  
**Technology stack:** Node.js, Express 5, PostgreSQL, Prisma 7, Zod 4, JWT and Playwright

### 1. Task Objective

Task 3 is to implement and verify the core REST API endpoints agreed upon by the team. The endpoints should create, retrieve, update and delete the relevant resources. They should return consistent responses and appropriate HTTP status codes, protect sensitive error details, validate incoming data, and enforce access permissions.

### 2. Work Completed So Far

#### 2.1 Repository and branch review

The backend project was opened in PowerShell and its Git status was checked.

- Working folder: `apps/backend`
- Branch shown: `test/backend/user-route`
- The branch was reported as up to date with its remote branch.
- `tests/api/user-test.spec.js` was shown as an untracked file, then staged with `git add .`.
- At that checkpoint, Git showed `tests/api/user-test.spec.js` as the staged file. It was left unchanged during this activity API work.

#### 2.2 Backend scripts and test setup review

The backend `package.json` was inspected. The relevant scripts include:

- `npm run dev` — starts the development server using Nodemon.
- `npm start` — starts the server using Node.js.
- `npm run test:api` — runs the Playwright API suite.
- `npm run db:seed` — runs the Prisma seed script.
- `npm run db:setup` — resets the configured database, applies the schema and seeds data. This must only be run against a disposable database.

The Playwright configuration starts the backend server for API tests. The test global setup truncates application tables before a run.

#### 2.3 Activity API route and controller review

The activity route and controller were reviewed.

- `GET /api/activity` requires authentication and retrieves the current user's activity by default.
- `POST /api/activity` requires authentication, CSRF validation and request-body validation before creating an activity.
- Task activity retrieval checks that the requester belongs to the task's project.
- Activity creation currently does not perform the same project-membership check when a `taskId` is supplied.

#### 2.4 Activity API tests added

Seven Playwright tests were added to or included in `tests/api/activity.spec.js`. They cover:

- Creating an activity and retrieving it from the user's activity list.
- Requiring authentication to list activity.
- Rejecting a whitespace-only action.
- Rejecting an invalid CSRF token.
- Preventing users from reading another user's activity log.
- Preventing non-members from logging activity against a task in another project.
- Preserving values such as `0` and `false`.

### 3. Test Results

#### 3.1 Full API suite

The supplied terminal transcript shows the command:

```powershell
npm run test:api
```

It reported **141 passed in 4.3 minutes**. This run appears earlier in the transcript than the focused activity test runs, so it should not be treated as a final full-suite run after the activity tests and any future fixes.

#### 3.2 Focused activity API tests

The seven activity API tests were run individually. **Four passed and three failed.**

Passing checks:

- Creating and retrieving the user's own activity.
- Requiring authentication for the activity list.
- Rejecting an invalid CSRF token.
- Preventing a user from retrieving another user's activity log.

Failing checks:

1. **Whitespace-only action:** Expected `400 Bad Request`; received `201 Created`. The schema checks for a string of at least one character but does not trim whitespace first.
2. **Activity for a task outside the user's project:** Expected `403 Forbidden`; received `201 Created`. The activity creation handler does not currently check project membership for the supplied task.
3. **Preserving falsy values:** Expected `oldValue` to be `"0"`; received `null`. The test stopped at this assertion, so the `newValue: false` assertion was not verified by that run.

The SSL mode messages in the terminal output were warnings; they did not cause these test failures.

### 4. Additional Finding to Verify: Client Missing-Record Response

The supplied draft reports a potential issue where requesting a missing client may return `500 Internal Server Error` instead of `404 Not Found`. This remains **unconfirmed** in the evidence reviewed here. Verify the client controller, shared error middleware and actual endpoint response together before reporting it as a confirmed defect.

### 5. Remaining Work

1. Confirm which database URL was active during the test runs.
2. Fix whitespace-only action validation, task-level authorization and falsy-value handling, if these behaviors match the team's requirements.
3. Rerun the seven focused activity tests against a disposable database.
4. Verify client, project and sprint CRUD routes and their service logic against the team's agreed scope.
5. Confirm missing records return `404` and unexpected database errors return a safe response.
6. Review role permissions and request validation for each protected endpoint.
7. Rerun the full API suite after fixes and record the new result.
8. Update API documentation if endpoint behavior or response formats change.
9. Review `git status` and staged changes before committing, preserving teammates' changes.

### 6. Database Safety Note

The test output explicitly says that application tables were truncated during setup. It does not show the database host used by the test process. An earlier inspection of `.env` found `pooled.db.prisma.io:5432`, but a PowerShell environment override may have changed the target for the tests. Confirm that a disposable database was used before presenting the run as safely isolated. If the tests used a shared database, check with the team whether any data needs restoration.

### 7. Acceptance Criteria

Task 3 will be ready for review when:

- Agreed endpoints perform the expected create, read, update and delete operations.
- Successful responses contain the expected data and status codes.
- Invalid requests return the agreed validation response.
- Missing records return an appropriate response such as `404 Not Found`.
- Protected endpoints enforce authentication and the correct permissions.
- Unexpected database errors do not expose sensitive internal details.
- Automated tests pass, or any remaining failures are clearly documented and reported.
- The final changes are reviewed and integrated through the team's workflow.


