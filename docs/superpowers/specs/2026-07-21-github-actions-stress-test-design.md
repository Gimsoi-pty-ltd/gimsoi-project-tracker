# GitHub Actions Stress Test Design

## Goal

Create a safe, manually triggered, team-visible stress test for `feat/backend/frontend-integration`. The test uses one disposable Prisma Postgres database, shows live stage metrics and record counts in GitHub Actions, and publishes downloadable results.

## Execution Architecture

The workflow runs in this order:

1. Validate the protected `stress-testing` GitHub environment and required secrets.
2. Refuse destructive work unless the database identifier and explicit reset authorization pass.
3. Apply committed Prisma migrations.
4. Reset and deterministically seed the disposable stress database.
5. Start one backend instance with production-like middleware while stubbing email and external integrations.
6. Run API smoke checks.
7. Run staged k6 load.
8. Print database record counts after each stage.
9. Run post-test data-integrity checks.
10. Upload logs and machine-readable and human-readable reports.

The workflow is available only through `workflow_dispatch`; it does not run on pushes or pull requests.

## Required Configuration

The GitHub environment is named `stress-testing`. It provides:

- `STRESS_DATABASE_URL`
- `STRESS_JWT_SECRET`
- `STRESS_CSRF_SECRET`
- a non-secret database identifier used by the safety guard

The workflow sets `ALLOW_STRESS_DB_RESET=true` only for its guarded reset step. Secrets must never be written to logs or artifacts.

## Application Readiness Fixes

Before load testing, correct the integration branch's malformed Prisma `orderBy` arguments and unreachable project response transformations. Add the missing migration for project scheduling fields, task hierarchy, owner IDs, and team IDs. Extend regression coverage for these corrected project queries and new schema fields.

## Seed Dataset

The deterministic synthetic dataset contains approximately:

- 40 users across supported roles
- 12 clients
- 30 projects
- 90 sprints
- 150 phases
- 3,000 tasks

It also contains project memberships, comments, labels, and activity needed by the load scenarios. Seed identifiers use a stress-only namespace so validation can distinguish synthetic records.

## Load Model

k6 supplies the measured API load. The existing Playwright API suite is a regression preflight, not the load generator.

Traffic is weighted as follows:

- 45% dashboard, project, and task reads
- 20% search and analytics
- 15% task creation
- 10% task status updates
- 5% comments
- 5% memberships, phases, and sprint operations

Stages:

- smoke: 2 users for 30 seconds
- 10 users for 1 minute
- 25 users for 2 minutes
- 50 users for 2 minutes
- 100 users for 2 minutes
- recovery: 10 users for 1 minute

The test uses isolated writable records for normal traffic and selected shared records for deliberate optimistic-concurrency contention.

## Thresholds

The initial acceptance thresholds are:

- unexpected request failure rate below 1%
- p95 response latency below 1.5 seconds
- p99 response latency below 3 seconds
- zero database-integrity failures

Expected `409 Conflict` responses from deliberate version-contention scenarios are measured separately and do not count as unexpected request failures.

## Live Visibility and Artifacts

GitHub Actions logs show the current stage, virtual-user level, request rate, latency summary, error rate, and aggregate record counts. The workflow does not expose individual database rows or a public application endpoint.

The completed run uploads:

- k6 JSON results
- a readable Markdown or HTML summary
- backend logs with secrets redacted
- post-run record counts
- integrity-check results

## Safety and Failure Handling

- Never target the existing development or production database.
- Require an explicit database identifier match before reset or seed operations.
- Require `ALLOW_STRESS_DB_RESET=true` for destructive setup.
- Stop before load generation if migrations, seed, backend startup, or smoke checks fail.
- Mark the workflow failed if thresholds or integrity checks fail.
- Upload diagnostic artifacts even on failure.
- Do not print environment variables, connection strings, tokens, passwords, or cookie values.

## Verification

Before the first team-visible run:

1. Validate Prisma schema and migration consistency.
2. Run targeted regression tests for corrected integration behavior.
3. Run a local two-user smoke test against the disposable database.
4. Verify reset guards reject missing or mismatched identifiers.
5. Verify workflow artifacts contain no secrets.
