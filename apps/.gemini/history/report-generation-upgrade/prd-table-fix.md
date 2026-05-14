# PRD — Table Alignment & Spacing Fix

## 1. Objective
Resolve the "header staircase" bug and ensure perfect vertical alignment across all table elements.

## 2. Requirements

### 2.1 Fixed Header Row
- **Problem**: Table headers currently cascade downward because `doc.y` updates after each column label is drawn.
- **Requirement**: Capture the starting `y` position at the beginning of `drawTableHeader`. Use this fixed `y` for all headers in the loop.

### 2.2 Harmonized Row Heights
- **Problem**: Header row (26pt) and Body rows (32pt) are mismatched.
- **Requirement**: Set `headerHeight` to **32pt**.

### 2.3 Centered Vertical Alignment
- **Requirement**: Update vertical offsets for all cell content (text and badges) to be consistently centered within the 32pt height.
- **Target Offset**: `y + 11`.

## 3. Success Criteria
- All table headers appear in a single horizontal line.
- Header and body rows have identical heights.
- All cell content is perfectly vertically centered.
