# Shared Database Stress Testing

The stress test is a manually triggered GitHub Actions workflow that resets and seeds only the dedicated disposable Prisma database. It must never target development or production data.

## GitHub environment

Create a protected GitHub environment named `stress-testing` and add these environment secrets:

- `STRESS_DATABASE_URL`: the complete disposable Prisma connection string
- `STRESS_DATABASE_FINGERPRINT`: SHA-256 of that exact connection string
- `STRESS_JWT_SECRET`: a long random test-only secret
- `STRESS_CSRF_SECRET`: a different long random test-only secret

Generate the fingerprint locally without printing the connection string:

```bash
cd apps/backend
set -a
source .env.stress
set +a
node --input-type=module -e "import crypto from 'crypto'; console.log(crypto.createHash('sha256').update(process.env.DATABASE_URL).digest('hex'))"
```

Protect the environment with required reviewers if the repository plan supports them. Do not store any real secret in repository variables, workflow YAML, artifacts, issues, or pull requests.

## Running the test

1. Open **Actions → Shared Database Stress Test**.
2. Select **Run workflow** on the stress-testing branch.
3. Enter `RESET-STRESS-DATABASE` in the confirmation field.
4. Follow live stage output in the job log and workflow summary.
5. Download the `stress-test-<run-id>` artifact for JSON and Markdown results, backend logs, record counts, and integrity results.

The run performs smoke, 10-user, 25-user, 50-user, 100-user, and recovery stages. A threshold failure stops later stages. Current thresholds are under 1% unexpected failures, p95 below 1.5 seconds, p99 below 3 seconds, and zero integrity failures.

## Local readiness check

Copy `.env.stress.example` to `.env.stress`, replace every placeholder, and keep the private file ignored. The destructive reset additionally requires:

```bash
export ALLOW_STRESS_DB_RESET=true
```

Useful commands:

```bash
npm run stress:guard
npm run stress:reset
npm run stress:seed
npm run stress:counts
npm run stress:integrity
```
