# PostgreSQL and Prisma 7 — Task 2

## Overview

This folder contains proposed database improvements for the Gimsoi Project Tracker.

The implementation focuses on PostgreSQL, Prisma 7, database relationships, constraints, indexes, migrations and seed data.

All proposed changes are isolated from the existing backend pending senior developer review.

## Technologies

- PostgreSQL 17
- Prisma ORM 7
- Node.js
- JavaScript ES Modules
- SQL

## Proposed Database Improvements

Five database indexes have been added to improve filtering and risk visibility:

1. Project status index
2. Sprint status index
3. Task project/status composite index
4. Task project/due-date composite index
5. Task project/blocked-status composite index

## Files

- `schema.proposed.prisma` — Proposed Prisma schema
- `prisma.config.proposed.ts` — Proposed Prisma configuration
- `seed.proposed.js` — Proposed JavaScript seed script
- `migration.proposed.sql` — Generated SQL migration proposal
- `database-tests.js` — Static database tests
- `REVIEW_NOTES.md` — Development notes

## Schema Validation

From `apps/backend`:

```powershell
npx prisma validate --schema=./database-task2-review/schema.proposed.prisma
```

Result: Passed.

## Generate Proposed SQL

```powershell
npx prisma migrate diff --from-schema=./prisma/schema.prisma --to-schema=./database-task2-review/schema.proposed.prisma --script --output=./database-task2-review/migration.proposed.sql
```

This generates SQL without applying it to PostgreSQL.

## Run Static Tests

```powershell
node .\database-task2-review\database-tests.js
```

Result: Six static checks passed.

These checks inspect schema and SQL definitions. They do not test database connectivity or runtime constraint enforcement.

## Seed Data

The proposed seed script includes safeguards against destructive execution.

Before running any seed script, verify that the target is a disposable development database containing no important records.

## Pending Integration Tests

- Verify PostgreSQL connectivity.
- Apply existing migrations to a clean development database.
- Apply the proposed index changes.
- Execute the seed script safely.
- Verify duplicate and invalid record handling against PostgreSQL.
- Confirm the database setup can be reproduced by another developer.

## Integration

The proposed schema and migration must be reviewed and integrated into the canonical Prisma schema and migration history before use by the application.

Do not apply the proposed SQL to production or a shared database without authorization.