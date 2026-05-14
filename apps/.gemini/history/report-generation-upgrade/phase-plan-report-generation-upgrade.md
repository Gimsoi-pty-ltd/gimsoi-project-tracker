# Phase Plan: report-generation-upgrade

## Phase 1 — Schema & Service Refactor

**Objective:** Update report validation schema with enums and enhance report service to fetch type-specific metrics.

---

### Files to Touch

- `apps/backend/schemas/report.schema.js`
- `apps/backend/services/report.service.js`

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All 128 baseline tests.
**New tests added this phase:** None (unit-level verification of schema/service only).
**Tests expected to be unaffected:** All existing API tests.

---

### Rollback Instruction

```bash
git checkout apps/backend/schemas/report.schema.js apps/backend/services/report.service.js
```

---

### Recommended Model

**Recommended:** Flash
**Reason:** Primarily schema updates and data aggregation logic in the service layer.

---

## Phase 2 — PDF Engine Refactor

**Objective:** Implement the branded PDF layout engine and support for three report types in the PDF utility.

---

### Files to Touch

- `apps/backend/utils/pdf.js`

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All 128 baseline tests.
**New tests added this phase:** None.
**Tests expected to be unaffected:** All existing API tests.

---

### Rollback Instruction

```bash
git checkout apps/backend/utils/pdf.js
```

---

### Recommended Model

**Recommended:** Pro
**Reason:** Complex PDFKit layout logic and multi-type template implementation requires higher reasoning.

---

## Phase 3 — Controller & Security

**Objective:** Update the report controller to include security headers and ensure correct PDF streaming.

---

### Files to Touch

- `apps/backend/controllers/report.controller.js`

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All 128 baseline tests.
**New tests added this phase:** None.
**Tests expected to be unaffected:** All existing API tests.

---

### Rollback Instruction

```bash
git checkout apps/backend/controllers/report.controller.js
```

---

### Recommended Model

**Recommended:** Flash
**Reason:** Simple header updates and handler logic.

---

## Phase 4 — Integration Testing

**Objective:** Write and execute new integration tests for all report types and security requirements.

---

### Files to Touch

- `apps/backend/tests/api/reports.spec.js`

---

### Expected `npm run test:api` Outcome

**Tests expected to PASS:** All 128 baseline tests + new report tests.
**New tests added this phase:** `tests/api/reports.spec.js` (6 new cases).
**Tests expected to be unaffected:** All existing API tests.

---

### Rollback Instruction

```bash
rm apps/backend/tests/api/reports.spec.js
```

---

### Recommended Model

**Recommended:** Flash
**Reason:** Standard integration test authoring.
