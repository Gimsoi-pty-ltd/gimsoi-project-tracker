# PRD — Final UI Polish

## 1. Objective
Zero-out the remaining UI bugs (header staircase and repetitive titles) to deliver a production-ready reporting engine.

## 2. Requirements

### 2.1 Fixed Table Headers
- **Problem**: Headers are cascading because PDFKit's `text()` moves the cursor even with absolute `y`.
- **Requirement**: Set `lineBreak: false` in `drawTableHeader`.

### 2.2 Clean Task Titles
- **Problem**: Project and Sprint prefixes are still appearing in some cases (e.g., "Sprint 1 - Foundation Task 1").
- **Requirement**: Use a robust two-step stripping logic:
  1. Remove project name prefix.
  2. Remove any "Sprint X - Name" prefix that precedes "Task" or a dash.

### 2.3 Unified Centering
- **Requirement**: Consistently use `y + 11` for all text and badges within the 32pt rows.

## 3. Success Criteria
- All table headers are perfectly aligned horizontally within the navy bar.
- Task titles are stripped to their core (e.g., "Task 1").
