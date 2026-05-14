# PRD — Dynamic Executive Narrative

## 1. Objective
Transform the PDF report's executive summary into a high-value interpretive narrative that provides instant clarity on project status.

## 2. Requirements

### 2.1 Narrative Generation Logic
- **Pacing**: Describe status based on `completionPercentage`.
- **Momentum**: Describe velocity trend (acceleration/fricton).
- **Risk Assessment**: Quantify critical blockers and overdue items.
- **Overall Health**: Map `sprintHealth` to a qualitative label (Stable, Critical, etc.).

### 2.2 Integration
- Utility function must be available in `utils/pdf.js`.
- Must replace the current static `summaryText` in `drawExecutiveSummary`.

## 3. Success Criteria
- The executive summary paragraph is unique to each report's data state.
- Metrics are embedded correctly into the sentences (e.g., "tracking at 85% completion").
