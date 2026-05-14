# Phase Plan: seed-dashboard

## Phase 1

**Objective:** Implement realistic data seeding logic in the prisma/seed script covering multi-sprint projects and diverse task metrics.

---

### Files to Touch

- `prisma/seed.js`

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All 128 existing tests (seed changes should not affect automated test runs which use separate setup).
**New tests added this phase:** None.
**Tests expected to be unaffected:** All existing API tests.

---

### Rollback Instruction

```bash
git checkout prisma/seed.js
```

---

### Recommended Model

**Recommended:** Flash
**Reason:** Single-file script modification, no cross-layer reasoning required.

---

## Phase 2

**Objective:** Verify seed data integrity by manually executing the seed and checking metrics aggregation via the API.

---

### Files to Touch

- `prisma/seed.js` (only if adjustments are needed after execution)

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All 128 existing tests.
**New tests added this phase:** None.
**Tests expected to be unaffected:** All existing API tests.

---

### Rollback Instruction

```bash
# Data is already in the DB, rollback requires re-running a clean seed or manual DB wipe
npx prisma db push --force-reset && npx prisma db seed
```

---

### Recommended Model

**Recommended:** Flash
**Reason:** Verification and minor adjustments only.
