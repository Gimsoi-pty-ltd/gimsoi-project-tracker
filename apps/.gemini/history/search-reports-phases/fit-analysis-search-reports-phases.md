# Fit Analysis: `search-reports-phases`

**Impact Score:** 85/100 (LARGE)
**Affected Files:** ~15-20 files across all layers.

## 5-Axis Analysis

1. **Schema Integrity:** High Impact. Adding 2 new models and 1 new relation to `Task`.
2. **Layer Boundaries:** Standard Impact. Follows the existing Controller -> Service -> Prisma pattern.
3. **Security/RBAC:** High Impact. New permissions needed for report generation and analytics access.
4. **Performance:** Medium Risk. Global search across 3 tables requires careful limit management.
5. **Infrastructure:** Low Impact. Adding `pdfkit` dependency.

## Risk Notes
- **Search Latency:** Parallelizing search queries is essential to prevent blocking the event loop.
- **PDF Streaming:** Must ensure the PDF buffer is streamed correctly to prevent memory spikes on large projects.
