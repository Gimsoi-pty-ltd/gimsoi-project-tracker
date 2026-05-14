# PRD: report-generation-upgrade

**Date:** 2026-05-05
**Author:** Antigravity Agent (feature-cycle Step 1)
**Status:** Draft

---

## Feature Summary

This feature refactors the PDF generation logic in the Gimsoi Project Tracker to produce styled, data-rich reports aligned with the Gimsoi brand design system. It introduces support for three distinct report types (`PROJECT_PROGRESS`, `SPRINT_METRICS`, and `TEAM_PERFORMANCE`), each with custom layouts including branded headers, footers with page numbering, KPI card sections, and data tables with status badges.

---

## User Story

As a project manager or administrator,
I want to generate professional, branded PDF reports for projects, sprints, and team performance,
so that I can share accurate progress and performance data with stakeholders in a clean, consistent format.

---

## Requirements

1. **Branded Layout Engine**: Implement a reusable layout engine in `utils/pdf.js` that supports:
    - Branded header (navy #002D62) and footer (slate-200 rule) with page numbering.
    - Cover page with report metadata.
    - Section headers with accent underlines.
2. **PROJECT_PROGRESS Report**: Generate a report including project status, description, task distribution, and a milestones table.
3. **SPRINT_METRICS Report**: Generate a report including sprint goal, velocity, health score, risk index, and a task list with status/priority badges.
4. **TEAM_PERFORMANCE Report**: Generate a report showing throughput and task distribution across assignees.
5. **Data Integration**: Update `report.service.js` to fetch necessary metrics (e.g., from `sprintService.getSprintMetrics()`) based on the requested report type.
6. **Schema Enforcement**: Update `report.schema.js` to restrict `type` to an enum: `PROJECT_PROGRESS`, `SPRINT_METRICS`, `TEAM_PERFORMANCE`.
7. **Security Headers**: Update `getReportPdfHandler` to set `Content-Security-Policy: default-src 'none'` and `X-Content-Type-Options: nosniff`.
8. **Null-Safety**: Ensure all report sections handle missing or null data gracefully with placeholder strings.

---

## Acceptance Criteria

- [ ] AC1: `POST /api/reports` with invalid type returns `400`.
- [ ] AC2: `GET /api/reports/:id/pdf` returns `Content-Type: application/pdf` and starts with `%PDF-`.
- [ ] AC3: `GET /api/reports/:id/pdf` includes correct security headers.
- [ ] AC4: `GET /api/reports/:id/pdf` for a `SPRINT_METRICS` report includes non-zero metrics if seeded.
- [ ] AC5: `GET /api/reports/:id/pdf` by a non-owner returns `403`.
- [ ] AC6: `GET /api/reports/:id/pdf` for a non-existent ID returns `404`.

---

## Out of Scope

- Frontend UI updates for report generation triggers.
- Multi-format support (e.g., CSV, Excel) — PDF only.
- Direct emailing of reports.

---

## Open Questions

- [ ] Should we support portrait and landscape orientations? (Defaulting to Portrait A4 for consistency).
- [ ] Are there specific team analytics metrics already available, or should we aggregate them on the fly?
