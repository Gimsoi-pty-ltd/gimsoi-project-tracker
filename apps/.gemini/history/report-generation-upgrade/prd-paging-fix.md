# PRD — Fixing Silent PDFKit Auto-Paging

## 1. Problem Statement
The report is generating blank pages (2, 4, 6, 8) because PDFKit's internal `maxY()` check triggers a silent `addPage()` whenever a `doc.text()` call occurs near the page boundaries. This happens during the cover page hero rendering and the footer rendering.

## 2. Goals
- **Eliminate Blank Pages**: Ensure the report contains only exactly the content pages intended.
- **Stable Branding**: Maintain the professional Navy palette while fixing the layout flow.

## 3. Technical Requirements

### 3.1 Global Margin Suppression
- **addBrandedPage**: Must suppress top and bottom margins to `0` for the entire duration of the header and footer draw.
- **drawCoverPage**: Must suppress margins to `0` for its entire duration to prevent the hero title from triggering an auto-page.

### 3.2 Drawing Sequence Safety
- Margins must be saved before suppression and restored immediately after the manual layout is complete.
- This ensures that *within* a content block (like a large table), PDFKit's standard text-wrapping logic still works as expected, but the branding elements do not trigger accidental pages.

## 4. Success Criteria
- Page 1: Cover
- Page 2: Executive Summary
- Page 3: Metrics/Tasks
- **NO BLANK PAGES** between sections.
