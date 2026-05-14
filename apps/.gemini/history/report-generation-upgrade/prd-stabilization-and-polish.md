# PRD — Stabilizing & Polishing Gimsoi Reporting Engine

## 1. Problem Statement
The current PDF engine suffers from a recursive stack overflow error triggered by the interaction between async drawing (charts) and PDFKit's `pageAdded` event. Furthermore, the client-side download scripts fail silently when the server returns a JSON error instead of a binary PDF.

## 2. Goals
- **Eliminate Recursion**: Move to a manual page-management strategy that is 100% predictable.
- **Visual Consistency**: Ensure margins, headers, and footer spacing are identical across all report types and sections.
- **Error Transparency**: Downloaders must detect and report server errors instead of saving them as corrupted PDF files.

## 3. Technical Requirements

### 3.1 PDF Layout Engine
- **Manual Pagination**: Remove `doc.on('pageAdded')`.
- **Branded Page Helper**: Implement `addBrandedPage()` which:
    - Creates a new page.
    - Draws Header/Footer.
    - Resets `doc.y` to a standard start position (`margins.T`).
- **Safety Margins**: Enforce a strict `80pt` bottom "safe zone." If any drawing operation (table row, KPI, chart) would enter this zone, `addBrandedPage()` must be called.

### 3.2 Performance & Reliability
- **Async Handling**: Main generation function must handle `await` calls for charts *between* page additions without losing state.
- **Page Numbering**: Track page numbers via a simple counter on the `doc` object.

### 3.3 Downloader Script
- **Response Validation**: Check `res.headers['content-type']`. 
- **Error Reporting**: If `application/json`, output the error message to the console and abort the file write.

## 4. Design Standards
- **Margin-Left/Right**: 57pt
- **Margin-Top**: 72pt (Content starts at 108pt after header)
- **Margin-Bottom**: 72pt (Footer starts at PageHeight - 64pt)
