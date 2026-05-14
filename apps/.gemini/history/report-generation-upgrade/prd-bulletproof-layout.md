# PRD — Bulletproof PDF Layout

## 1. Objective
Ensure 100% deterministic layout for tables and charts by removing reliance on PDFKit's internal cursor management.

## 2. Requirements

### 2.1 Chart Page Clearance
- **Problem**: Images drawn near the bottom of a page run over the margin and overlap with following text.
- **Requirement**: Check `doc.y` before `doc.image`. If less than 240pt remain, trigger `addBrandedPage`.

### 2.2 Table Layout Stability (Zero Side-Effects)
- **Problem**: `doc.text()` updates `doc.y` internally, causing "staircasing" in headers and inconsistent gaps between rows.
- **Requirement**:
    - Use a local `currentY` variable to track vertical position.
    - Pass this variable to every drawing operation.
    - Manually increment `currentY` after each row.
    - Disable implicit line breaks in headers to prevent bounding box shifts.

## 3. Success Criteria
- Headers sit in a perfectly flat horizontal line.
- Table body rows sit immediately below the header without large gaps.
- Charts never overlap with section headings.
