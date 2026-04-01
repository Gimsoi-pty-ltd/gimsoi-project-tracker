# Backend Data Contract (Analytics & Consistency)

This document serves as the authoritative definition of data shapes returned by the Gimsoi Project Tracker backend. These contracts are enforced to maintain compatibility with the analytics processing engine and the frontend state management.

## 1. Core Entities

### 1.1 Task Object
The primary unit of work. Status transitions are strictly governed by the backend state machine.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Unique identifier. |
| `title` | `String` | Task name (immutable once `DONE` or `CANCELLED`). |
| `status` | `Enum` | One of `TASK_STATUS` (see below). |
| `priority` | `Enum` | `LOW`, `MEDIUM`, `HIGH`, `URGENT`. |
| `projectId` | `UUID` | Parent project identifier. |
| `sprintId` | `UUID?` | Parent sprint identifier (null for ad-hoc tasks). |
| `assigneeId` | `UUID?` | User assigned to the task. |
| `dueDate` | `ISO8601?`| Projected completion date. |
| `completedAt` | `DateTime?` | Set automatically when task status transitions to DONE. Null for all non-DONE tasks. Never set manually. Guaranteed By: task.service.js — updateTask |

### 1.2 Sprint Object
Iteration container for tasks.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Unique identifier. |
| `name` | `String` | Sprint name. |
| `status` | `Enum` | One of `SPRINT_STATUS` (see below). |
| `startDate` | `ISO8601?`| Sprint commencement. |
| `endDate` | `ISO8601?`| Sprint target completion. |

### 1.3 Project Summary Object
Used by analytics for high-level progress tracking.

| Field | Type | Description |
| :--- | :--- | :--- |
| `TODO` | `Number` | Count of tasks in `TODO` state. |
| `IN_PROGRESS` | `Number` | Count of tasks in `IN_PROGRESS` state. |
| `DONE` | `Number` | Count of tasks in `DONE` state. |
| `CANCELLED` | `Number` | Count of tasks in `CANCELLED` state. |
| `total` | `Number` | `TODO + IN_PROGRESS + DONE + CANCELLED`. |
| `percentComplete`| `Number` | Integer `0-100`. |

### 1.4 Derived and Calculated Fields
- **Project Summary (`getProjectTaskSummary`)**: Excludes individual task fields such as `completedAt` in favour of aggregate counts.

---

## 2. Status State Machines

### 2.1 Task Status (`TASK_STATUS`)
Defined in `apps/backend/constants/statuses.js`.

| Status | Terminal | Description |
| :--- | :--- | :--- |
| `TODO` | No | Initial state. |
| `IN_PROGRESS` | No | Active work. |
| `BLOCKED` | No | Work halted by external factor. Must return to `IN_PROGRESS`. |
| `DONE` | **Yes** | Completed work. Immutable. Requires `ACTIVE` sprint. |
| `CANCELLED` | **Yes** | Abandoned work. Immutable. |

### 2.2 Sprint Status (`SPRINT_STATUS`)
| Status | Description |
| :--- | :--- |
| `PLANNING` | Initial setup. Tasks cannot transition to `DONE`. |
| `ACTIVE` | Execution phase. |
| `CLOSED` | Sprint concluded. All tasks are locked. |

---

## 3. Runtime Enforcement
*Runtime shape enforcement is ACTIVE in the service layer.*

- **Task Objects**: Validated in `getTaskById`, `createTask`, and `updateTask`. Missing required fields or invalid statuses trigger a `ContractViolationError` (500).
- **Project Summaries**: Validated in `getProjectTaskSummary` and `getTaskCompletionStats`. Missing status counts or invalid percentages trigger a `ContractViolationError` (500).
- **Transitions**: Validated against the `ALLOWED_TRANSITIONS` map in `task.service.js`. Illegal moves trigger a `StateTransitionError` (400).

---

## 4. Maintenance
Update this document whenever a Prisma schema change affects fields exposed to the analytics layer. Cross-reference changes with `apps/backend/constants/statuses.js`.

---

## 5. Analytics Alignment Notes
completedAt is now available. Lead-time can be calculated as completedAt - createdAt for DONE tasks. Null values indicate the task has not yet completed.

## Changelog
- **2026-03-31**: completedAt field added to Task model and contract.
