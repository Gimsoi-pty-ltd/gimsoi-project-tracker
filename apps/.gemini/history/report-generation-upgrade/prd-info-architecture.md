# PRD — Executive Dashboard Fast-Track

## 1. Goal
Frontload Context and Health to Page 2. Move History to Page 3.

## 2. Requirements
- **Page 2 Transformation**: `drawExecutiveSummary` must now render `drawMetadataBlock` (Goal) + two `drawKpiRow` (Health/Risk) + `Red Flags`.
- **Boilerplate/Chart Removal**: Delete boilerplate text and move Velocity Chart out of summary.
- **Deep Dive (Page 3+)**: `buildSprintMetricsReport` / `buildProjectProgressReport` now start with the Velocity Chart and tables.
- **No Duplication**: Remove KPI/Metadata calls from the report builders.
