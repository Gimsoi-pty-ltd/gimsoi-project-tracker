# PRD — Final Report UI Polish

## 1. Objective
Ensure the PDF report is mathematically robust and visually premium by addressing the final "polish" items identified in the UX audit.

## 2. Requirements

### 2.1 Dynamic Layouts (Red Flags)
- **Problem**: Fixed 20pt row height clips multi-line text.
- **Solution**: Calculate the height of the `reason` text dynamically using PDFKit's `heightOfString`.
- **Requirement**: Set row height to `Math.max(24, textHeight + 10)` to provide consistent padding.

### 2.2 Whitespace Optimization (KPIs)
- **Problem**: 8pt gutter feels cramped and "crowded."
- **Solution**: Increase the gutter between KPI cards to **16pt**.
- **Requirement**: Update the `cardWidth` calculation to: `Math.floor((totalWidth - (gutter * (kpis.length - 1))) / kpis.length)`.

## 3. Success Criteria
- Red Flag reasons with multiple lines wrap correctly and expand the background rectangle.
- KPI cards have significant breathing room between them.
- All layout elements remain perfectly aligned within the margins.
