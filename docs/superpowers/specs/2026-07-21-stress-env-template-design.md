# Stress Environment Template Design

## Goal

Provide a safe, branch-owned template for configuring the disposable Prisma stress-test database, together with an ignored local copy where a developer can insert the real connection string.

## Files

- `apps/backend/.env.stress.example` is tracked and contains placeholders only.
- `apps/backend/.env.stress` is ignored and initially contains the same placeholders.

## Configuration

Both files define `DATABASE_URL`, `STRESS_DATABASE_URL`, `NODE_ENV`, `PORT`, `JWT_SECRET`, `CSRF_SECRET`, and `CLIENT_URL`. Connection-string placeholders are explicit and contain no usable credential.

## Safety

The private file must be confirmed ignored with `git check-ignore`. This change does not connect to, migrate, seed, truncate, or otherwise modify any database.

## Verification

- Confirm the example file is tracked.
- Confirm the private file is ignored.
- Confirm both files contain placeholders and no real connection string.
