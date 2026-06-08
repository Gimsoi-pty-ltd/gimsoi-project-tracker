# Changes Made

This update stabilizes the frontend environment, repairs broken navigation, and ensures cross-service compatibility for Zoho Cloud deployment.

## Features Added

### Deployment Compatibility
*   **Standardized API Layer**: Standardized the API base URL to `/api` and updated networking logic. This allows the frontend to communicate with all backend services (Tasks, Projects, etc.) instead of being locked specifically to Authentication.

### Environment Stability
*   **Standardized Directory Structure**: Renamed 6+ directories with illegal spaces and updated 30+ internal import references to prevent Vite build failures on modern hosting platforms.

### Integrity Fixes
*   **Kanban Restoration**: Resolved a critical naming mismatch in the Kanban component (`KanbanCard.jsx`) that was causing a runtime crash.
*   **Asset Cleanup**: Removed unreachable/empty placeholder files to ensure a 100% clean production build.

## Testing (apps/frontend)
*   **Update Dependencies**: `npm install`
*   **Verify Build**: `npm run build`
*   **Manual Testing**: Navigate through the application's sidebar and verify that all modules (Dashboard, Tasks, Projects, Kanban, and Settings) render correctly without console errors.

## Deployment Links
*   **Frontend**: [https://gimsoi-project-track-cbrmmedm.onslate.com](https://gimsoi-project-track-cbrmmedm.onslate.com)

---

## Backend connection status

Last updated: June 2026. This is the single reference for what is wired to the API vs what still uses mock/local data or is broken.

### Zustand stores (`src/store/`)

| Store | Connected | Notes |
|-------|-----------|-------|
| `authStore.js` | Yes | Login, signup, logout, verify email, forgot/reset password → `/api/auth/*` |
| `projectStore.js` | Partial | Projects CRUD + progress → `/api/projects`. Dashboard load → `/api/sprints`, `/api/tasks`, `/api/sprints/:id/velocity` via `fetchDashboard()` |
| `clientStore.js` | Yes | List/create clients → `/api/clients` |
| `taskStore.js` | Partial | **Read list uses mock data** (`setTimeout`). Create/update/delete/getById/summary → real API |
| `sprintStore.js` | Partial | **Read list uses mock data** (`setTimeout`). Create/update/status → real API |

---

### `src/Dashboard/` (home dashboard widgets)

Loaded by `Components/Dashboard/DashboardCards.jsx` via `projectStore.fetchDashboard()`.

| File | Status | API / source |
|------|--------|----------------|
| `SprintDateFilter.jsx` | Connected | `GET /api/sprints?projectId=` |
| `Metrics/totalTasks.jsx` | Connected | Derived from sprint tasks (`GET /api/tasks`) |
| `Metrics/completionPercentage.jsx` | Connected | Derived from sprint tasks |
| `Metrics/Velocity.jsx` | Connected | `GET /api/sprints/:id/velocity` (+ previous sprint for %) |
| `Metrics/SprintHealth.jsx` | Connected | Derived (health score from sprint tasks) |
| `Metrics/DeliveryRisk.jsx` | Connected | Derived (100 − sprint health) |
| `Metrics/OverdueTasks.jsx` | Connected | Derived from sprint tasks |
| `Metrics/BlockedTasks.jsx` | Connected | Derived from sprint tasks |
| `Metrics/ActiveTasks.jsx` | Connected | `GET /api/tasks` (sprint-filtered) |
| `charts/TaskDistributionCard.jsx` | Connected | Priority buckets from sprint tasks (not task type) |
| `PriorityHeatmap.jsx` | Connected | Priority × status grid from sprint tasks |
| `KanbanSummary.jsx` | Connected | Status counts from sprint tasks |
| `charts/BurnDownCard.jsx` | **Not connected** | No burndown time-series endpoint |
| `Metrics/SprintGoal.jsx` | **Partial** | Task completion % works; planned goal/points — no sprint field in API |

**Dashboard gaps (need backend or schema work):**
- Burndown chart endpoint
- Sprint goal / planned story points on `Sprint` model
- Story points on `Task` model (UI shows `—`)
- “Review” kanban/heatmap column (no `REVIEW` in `TaskStatus` enum)

---

### `src/Pages/`

#### LogInOut-flow
| Page | Status | API |
|------|--------|-----|
| `LoginPage.jsx` | Connected | `authStore` → `/api/auth/login` |
| `SignUpPage.jsx` | Connected | `/api/auth/signup` |
| `EmailVerification.jsx` | Connected | `/api/auth/verify-email` |
| `ForgotEmailPage.jsx` | Connected | `/api/auth/forgot-password` |
| `ResetPassword.jsx` | Connected | `/api/auth/reset-password` |
| `Dashboard.jsx` | Connected | Renders `DashboardCards` (wired above) |

#### Project-Management
| Page | Status | API |
|------|--------|-----|
| `projects.jsx` | Connected | `GET/POST/PATCH/DELETE /api/projects` |
| `projectOverview.jsx` | Connected | Project by id, progress, delete, update |

#### Tasks
| Page | Status | API |
|------|--------|-----|
| `TasksPage.jsx` | **Partial** | Uses `taskStore.getTasks()` → **mock data** |
| `OverdueTasks.jsx` | **Partial** | Same mock `getTasks()` |
| `BlockedTasks.jsx` | **Partial** | Same mock `getTasks()` |
| `ActiveProjects.jsx` | **Not connected** | Hardcoded project/task arrays |

#### Sprints
| Page | Status | API |
|------|--------|-----|
| `SprintOverview.jsx` | **Partial** | `sprintStore.getSprints()` + `taskStore.getTasks()` → **mock reads** |
| `SprintVelocity.jsx` | **Not connected** | Hardcoded velocity history |

#### KanbanBoard
| Page | Status | API |
|------|--------|-----|
| `KanbanBoard.jsx` | **Not connected** | `SAMPLE_COLUMNS` local state only; drag-drop not persisted |

#### Phases
| Page | Status | API |
|------|--------|-----|
| `Phases-of-tasks.jsx` | **Broken / not connected** | Uses `useProject()` (undefined); expects mock project/sprint shape. Backend has `GET /api/phases` |

#### Reports-and-Exporting
| Page | Status | API |
|------|--------|-----|
| `reports.jsx` | **Not connected** | Reads `activeSprint` / `activeProject` from store (wrong import path `ProjectStore`); no fetch |
| `sprintReports.jsx` | **Not connected** | Expects `activeSprint`, `projectSprints` on `sprintStore` (not populated); mock-style UI |
| `projectReports.jsx` | **Not connected** | Hardcoded stats and chart data |
| `teamPerformance.jsx` | **Not connected** | Hardcoded team chart. Backend has `GET /api/analytics/team` |

#### Team-Insights
| Page | Status | API |
|------|--------|-----|
| `TeamInsights.jsx` | **Not connected** | Store fields + mock-shaped sprint data; wrong `ProjectStore` import |

#### Users
| Page | Status | API |
|------|--------|-----|
| `Clients.jsx` | Connected | `clientStore` → `/api/clients` |
| `Users.jsx` | Partial | `fetch('/api/users')` — may need `resourceAPI` base URL; not using shared store |
| `Teams.jsx` | **Broken / not connected** | References undefined `projects` / `teamMembers` |
| `UserManagementPage.jsx` | **Not connected** | Static hub stats only |

#### Profile
| Page | Status | API |
|------|--------|-----|
| `Profile.jsx` | **Not connected** | Expects `user` on `projectStore` (not implemented); should use `authStore` |
| `Search.jsx` | **Not connected** | Expects `searchableItems` on store (not implemented). Backend has `GET /api/search` |

#### Settings (`Settings.jsx` + sections)
| Section | Status | API |
|---------|--------|-----|
| `ProfileSection.jsx` | **Not connected** | `updateUserProfile`, `user` on `projectStore` — not implemented |
| `SecuritySection.jsx` | **Not connected** | `updateUserPassword` on store — not implemented; local `setTimeout` mock save |
| `PreferencesSection.jsx` | **Not connected** | `theme`, `preferences`, `toggleDarkMode` — not in store |
| `ActivitySection.jsx` | **Not connected** | `user` on wrong `ProjectStore` import |
| `StorageSection.jsx` | **Not connected** | Static UI only |

#### Other pages
| Page | Status | API |
|------|--------|-----|
| `Calendar/Calendar.jsx` | **Not connected** | Expects `calendarEvents` on store (not implemented) |
| `Documents/Documents.jsx` | **Not connected** | Expects `documents` on store (not implemented) |
| `Help/HelpSupport.jsx` | **Not connected** | Expects `helpTopics` on store (not implemented) |
| `Task-Progress/*` | **Not connected** | Used inside Tasks tab; fed by mock `taskStore` data |

---

### `src/Components/` (shared)

| Component | Status | Notes |
|-----------|--------|-------|
| `Dashboard/DashboardCards.jsx` | Connected | Orchestrates `src/Dashboard/*` + `fetchDashboard` |
| `Dashboard/BlockedTasks.jsx`, `OverdueTasks.jsx`, etc. | **Legacy / not connected** | Old dashboard cards with inline mock arrays; not used on home route |
| `ProjectForm/ProjectForm.jsx` | Connected | Create/update via `projectStore` |
| `Common/SideBar.jsx` | Connected | Projects → `projectStore` (`GET /api/projects`). Project switch → `switchProject` / `fetchDashboard`. User + logout → `authStore` |
| `Common/TopBar.jsx` | **Partial** | Reads `user` from `projectStore` (should be `authStore`) |

---

### Recommended next wiring (existing backend only)

1. Fix `taskStore.getTasks` and `sprintStore.getSprints` to call real APIs (unblocks Tasks + Sprint pages).
2. Wire `KanbanBoard` to `GET /api/tasks` + `PATCH /api/tasks/:id` for status moves.
3. Wire `teamPerformance.jsx` → `GET /api/analytics/team`.
4. Wire `Phases-of-tasks.jsx` → `GET /api/phases` (fix `useProject` → `useProjectStore`).
5. Point Profile/TopBar/Settings at `authStore` + `/api/users` routes where they exist.
