# Backend Test Suite

All backend tests are written with [Playwright Test](https://playwright.dev/docs/api/class-test) and run via:

```bash
npm run test:api
```

---

## Directory Structure

```
tests/
├── api/
│   └── auth.spec.js          # Auth endpoint integration tests
└── services/
    └── SprintService.test.js # SprintService domain unit tests
```

---

## Test Files

### `api/auth.spec.js` — Auth Endpoint Tests

**Type:** Integration (real HTTP requests against a live server + real PostgreSQL database)

The Playwright `webServer` config in `playwright.config.js` automatically boots the Express server on `http://localhost:5001` before any test runs. The tests make actual HTTP requests against the running server.

| Endpoint | Scenario | Expected |
|---|---|---|
| `GET /api/auth/csrf-token` | Fetch a CSRF token (runs in `beforeEach`) | `200` |
| `POST /api/auth/signup` | Valid data | `201` + `token` |
| `POST /api/auth/signup` | Duplicate email | `400` |
| `POST /api/auth/signup` | Missing fields | `400` |
| `POST /api/auth/signup` | No CSRF token | `403` |
| `POST /api/auth/login` | Valid credentials | `200` + `token` |
| `POST /api/auth/login` | Wrong password | `400` |
| `POST /api/auth/login` | Unknown email | `400` |
| `POST /api/auth/login` | Missing fields | `400` |
| `POST /api/auth/login` | No CSRF token | `403` |
| `GET /api/auth/check-auth` | Valid Bearer token | `200` |
| `GET /api/auth/check-auth` | No token | `401` |
| `GET /api/auth/check-auth` | Malformed token | `401` |
| `POST /api/auth/logout` | Clears session | `200` → check-auth returns `401` |
| `POST /api/auth/forgot-password` | Known email | `200` |
| `POST /api/auth/forgot-password` | Unknown email (prevent enumeration) | `200` |
| `POST /api/auth/forgot-password` | Missing email | `400` |
| `POST /api/auth/verify-email` | Invalid code | `400` |
| `POST /api/auth/reset-password/:token` | Invalid token | `400` |
| Rate limiter | 15 rapid login attempts | `429` |

> **Skipped tests (`test.fixme`):** The `verify-email` and `reset-password` happy paths require a real email verification token from the mailer. These are deferred until a mailer mock is introduced.

---

### `services/SprintService.test.js` — Sprint Domain Unit Tests

**Type:** Unit (no network, no database — pure function logic with mocked DB)

| Scenario | Expected |
|---|---|
| `closeSprint` with open tasks | Throws `StateTransitionError` |
| `closeSprint` with all tasks done | Calls `db.sprint.update` exactly once with `status: CLOSED` |
| `updateSprintStatus` illegal transitions (e.g. `CLOSED → ACTIVE`) | Throws `StateTransitionError` |

---

## CI/CD Integration

Tests run automatically on every push via **GitHub Actions** (`.github/workflows/auth-tests.yml`).

### Pipeline Flow

```
git push
   │
   ▼
1. Checkout code
2. Setup Node.js 24
3. npm ci                   ← installs from lockfile (deterministic)
4. npx playwright install   ← installs Chromium browser binaries
5. npx prisma db push       ← applies schema to CI postgres container
6. npm run test:api         ← Playwright boots the server, runs all tests
7. Upload playwright-report ← always uploaded, even on failure
```

### CI Services

A `postgres:15` container is provisioned automatically as a GitHub Actions service. The schema is applied fresh on every run via `prisma db push` before tests execute.

### Environment in CI

| Variable | Source | Notes |
|---|---|---|
| `DATABASE_URL` | Hardcoded in YAML | Points to the CI postgres container |
| `JWT_SECRET` | Hardcoded dummy | Safe CI-only value, not used in production |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Hardcoded dummy | SMTP is bypassed when `NODE_ENV=test` |
| `NODE_ENV` | `test` | Activates email stub in `emailService.js` |
| `PORT` | `5001` | Must match `playwright.config.js` baseURL |

### Email Behaviour in CI

When `NODE_ENV=test`, every function in `emailService.js` returns early without making any SMTP connection. This means tests that trigger signup (which sends a verification email) complete successfully without real credentials.

### Test Report

The Playwright HTML report is uploaded as a GitHub Actions artifact (`playwright-report`) after every run and retained for 14 days. Download it from the **Actions** tab to inspect failures with full traces and request/response logs.

---

## Running Tests Locally

```bash
# From apps/backend/
npm run test:api
```

Requires a `.env` file with `DATABASE_URL`, `JWT_SECRET`, and `PORT=5001`. The server is started automatically by Playwright via the `webServer` config — do not start it manually.
