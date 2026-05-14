# PRD: Search, Reports, and Phases

**Date:** 2026-04-28
**Feature:** `search-reports-phases`
**Status:** Approved (via user prompt)

---

## 1. Executive Summary
This feature expands the Gimsoi Project Tracker with advanced organizational and analytical tools: Global Search, Project Phases, PDF Reporting, Team Analytics, and Sprint Velocity.

## 2. Scope & Requirements

### R1: Global Search
- **Endpoint:** `GET /api/search?q=&type=`
- **Functionality:** Single-query search across Projects (name), Tasks (title, description), and Users (name, email).
- **Filtering:** Optional `type` parameter to restrict results.

### R2: Project Phases
- **Model:** New `Phase` model related to `Project`.
- **Functionality:** CRUD for phases. Tasks can be optionally associated with a phase.
- **Endpoints:** `POST /api/phases`, `GET /api/phases?projectId=`.

### R3: PDF Reporting
- **Model:** New `Report` model.
- **Functionality:** Create report entries and export Project/Sprint data to PDF.
- **Endpoints:** `POST /api/reports`, `GET /api/reports/:id/pdf`.

### R4: Team Analytics
- **Endpoint:** `GET /api/analytics/team`
- **Functionality:** Aggregated completion metrics per user (Assigned vs Completed).

### R5: Sprint Velocity
- **Endpoint:** `GET /api/sprints/:id/velocity`
- **Functionality:** Calculate velocity based on total `DONE` tasks in a specific sprint.

## 3. Acceptance Criteria
- [ ] AC1: Global search returns results from all three domains in one JSON object.
- [ ] AC2: Project Phases can be created and filtered by project.
- [ ] AC3: `GET /reports/:id/pdf` returns a valid binary PDF stream.
- [ ] AC4: Team analytics correctly groups task counts by user role and status.
- [ ] AC5: Sprint velocity matches the count of tasks with `status: DONE`.

## 4. Constraints
- Must use `pdfkit` for PDF generation.
- Must follow ESM and existing Prisma patterns.
- Must maintain the 93 existing baseline tests.
