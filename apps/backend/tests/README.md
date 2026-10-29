# Backend Test Suite

All backend tests use [Playwright Test](https://playwright.dev/docs/api/class-test). Most are API integration tests that send real HTTP requests to a live server backed by a real PostgreSQL database.

## Run the tests

From `apps/backend/`:

```bash
npm run test:api
```

Playwright starts the server itself (`node server.js`), so do not start one manually. Locally the test server runs on **port 5002**, so it never collides with `npm start` on 5001. To run one file:

```bash
npx playwright test tests/api/health.spec.js --workers=1
```

## Test database (required, read this first)

`tests/setup/globalSetup.js` **truncates every table** in the database at the start of each run. Never point the tests at a database whose data you want to keep.

Locally, `playwright.config.js` therefore loads a separate `.env.test` file and **refuses to run** if:

- `.env.test` is missing,
- it has no `DATABASE_URL`, or
- its `DATABASE_URL` is identical to the one in `.env`.

One-time setup (Windows CMD, from `apps/backend/`):

1. Create a second, empty PostgreSQL database dedicated to tests (for example a new Prisma Postgres database).
2. Copy your settings and change only the database line:
```
   copy .env .env.test
```
   Then edit `.env.test` and put the **test** database URL in `DATABASE_URL`. `.env.test` is git-ignored (rule `.env.*`). Never commit it.
3. Create the tables in the test database:
```
   node -e "require('dotenv').config({path:'.env.test',override:true,quiet:true}); require('child_process').execSync('npx prisma db push',{stdio:'inherit'})"
```
   `db push` is used because a fresh database cannot currently be built from the migrations (see Known issues).

Optional check that your dev database is untouched: count its rows before and after a run.

## Test data and reset

- `globalSetup` wipes all tables once per run, so every run starts empty.
- Each test creates its own data through the fixtures in `tests/fixtures/authFixtures.js`: `adminApi`, `pmApi`, `internApi`, `clientApi` (authenticated clients with CSRF handled automatically) and `testClient`, `testProject`, `testSprint` (fresh records with unique names).
- Tests do not depend on seed data or on each other.

## Directory structure

```
tests/
  api/        Playwright API specs (26 files, 192 tests)
  fixtures/   authFixtures.js: role-based API clients and data helpers
  services/   SprintService.test.js (unit test, not run by npm run test:api)
  setup/      globalSetup.js: wipes the test database before each run
```

## What the specs cover

Existing specs cover auth, users, clients, projects, sprints, tasks, task lifecycle, phases and milestones, members, labels, comments and activity, analytics, health score, bulk operations, search and reports, urgency sort, RBAC, error handling and an end-to-end flow.

Negative-path specs (authentication 401, authorisation 403, validation 400, not found 404; each asserts status code and response body):

| File | Covers |
|---|---|
| `health.spec.js` | `GET /api/health` shape and public access |
| `clients-negative.spec.js` | Clients: no token, CLIENT role, empty body, unknown id |
| `projects-negative.spec.js` | Projects: no token, INTERN/CLIENT roles, invalid body, missing version, unknown id |
| `sprints-negative.spec.js` | Sprints: no token, INTERN/CLIENT roles, invalid body, invalid status, missing projectId |
| `tasks-negative.spec.js` | Tasks: no token, CLIENT role, invalid body, invalid filters, missing version, unknown id |

## Reading the results

- A line starting with a tick means passed, a cross means failed.
- Each failure prints the test name, the expected and received values and the line of the assertion.
- The summary at the end gives the counts (`N passed`, `N failed`) and lists failed tests.
- Extra detail per failure is saved under `test-results/`.

## CI

`.github/workflows/auth-tests.yml` runs `npm run test:api` on every push and on pull requests to `main`. It uses Node 22 and a throwaway `postgres:15` service container, applies the schema with `prisma db push` and runs the tests on port 5001. In CI (`CI=true`) the config skips the `.env.test` check because the workflow provides its own database.

## Known issues

- **Failing test:** `clients-negative.spec.js` "ADMIN gets 404 for an unknown client id" fails: `GET /api/clients/:id` returns 500 instead of 404 (backend defect, see the defect report).
- **Migrations:** `prisma migrate deploy` fails on an empty database at `20260526035242_sync_schema_and_migrations` (`enum label "BLOCKED" already exists`). Use `prisma db push` for test databases.
- **Not run by the suite:** `services/SprintService.test.js` is outside `testDir` (`tests/api`).