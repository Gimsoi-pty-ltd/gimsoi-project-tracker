# PRD — UI Engineering Polish

## 1. Objective
Optimize the reporting engine for scannability, professional vertical rhythm, and data-ink ratio.

## 2. Requirements

### 2.1 Trend Integrity
- **Logic**: A trend requires at least two points of comparison.
- **Requirement**: Hide the `drawVelocityChart` section entirely if `report.historicalVelocity.length < 2`.

### 2.2 Table Vertical Rhythm
- **Padding**: Rows currently feel cramped at 22pt.
- **Requirement**: Increase `rowHeight` to **32pt**. Adjust vertical offsets to keep text centered within the larger rows.

### 2.3 Scannability (Task Titles)
- **Problem**: Table rows are polluted with repetitive Project/Sprint prefixes (e.g., "Customer Portal V2 - Sprint 2 - Integration Task 1").
- **Requirement**: Use a robust regex to strip all hierarchical prefixes from task titles before they hit the table.
- **Problem**: Brute-force `substring` truncation cuts off context mid-word.
- **Requirement**: Remove `substring` calls and rely on the renderer's `ellipsis` logic.

## 3. Success Criteria
- No "Performance Trends" box is shown if only one sprint exists.
- Table rows have clear vertical separation.
- Task titles read as "Integration Task 1" rather than the full project string.
