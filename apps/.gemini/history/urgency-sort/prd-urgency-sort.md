# PRD: Urgency Sort

## Overview
Add an optional `?sortBy=urgency` query parameter to the `GET /api/tasks` endpoint. Tasks should be returned sorted by a computed urgency score.

## Scoring Formula
`urgencyScore = priority_weight × (days_overdue + 1) × phase_multiplier`

### priority_weight
- URGENT: 4
- HIGH: 3
- MEDIUM: 2
- LOW: 1

### days_overdue
- `task.dueDate < today` AND status NOT IN [DONE, CANCELLED]
- `Math.floor((Date.now() - task.dueDate) / 86400000)`
- Else: 0

### phase_multiplier
- `isBlocked === true`: 2.0
- Else if `days_overdue > 0`: 1.5
- Else: 1.0

## Requirements
- Default sort (no `sortBy` param) remains `createdAt desc`.
- `urgencyScore` field included in response only when `sortBy=urgency`.
- `phase` relation (id, status) included in response only when `sortBy=urgency`.
- Score computation happens in-memory after fetching tasks (current page size ≤ 50).

## Acceptance Criteria
- 117 tests pass.
- `GET /api/tasks?projectId=X&sortBy=urgency` returns sorted tasks.
- Terminal statuses (DONE, CANCELLED) have `days_overdue = 0`.
- `isBlocked` takes precedence in the multiplier.
