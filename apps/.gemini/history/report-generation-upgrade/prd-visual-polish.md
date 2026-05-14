# PRD — Report Visual Polish & Premium Branding

## 1. Goal
Elevate the Gimsoi Reporting Engine to client-ready standards through advanced typography, status badging, and refined spatial layout.

## 2. Requirements

### 2.1 Status & Priority Badging
- Implement `drawBadge(doc, x, y, label, palette)` helper.
- Tables must use this helper for "Status" and "Priority" columns.
- Colors must be pulled from the existing `STATUS_COLORS` and `PRIORITY_COLORS` maps.

### 2.2 Cover Page Redesign
- **Hero Title**: Project Name rendered in 28pt bold Navy.
- **Subtitle**: Report type (e.g., SPRINT METRICS) in 16pt Blue.
- **Spacing**: Increase padding between header band and metadata table.

### 2.3 Structural Layout Polish
- **Metadata Blocks**: All metadata (Sprint Details, Project Overview) must use alternating background rows for readability.
- **KPI Separation**: Add a faint rule line or 24pt gap between consecutive KPI rows.
- **Red Flags Fix**: Correct drawing sequence so text renders *inside* the navy header block.
- **Chart Fallback**: Bordered box with centered "Chart Unavailable" icon/text.

## 3. Design Tokens
- **Hero Font Size**: 28pt
- **Subtitle Font Size**: 16pt
- **Badge Font Size**: 8pt Bold
- **Badge Border Radius**: 4pt
