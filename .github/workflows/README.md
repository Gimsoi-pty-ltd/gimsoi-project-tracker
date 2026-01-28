# GitHub Actions Workflows

This directory contains the automated CI/CD pipelines for the Gimsoi AI Project Tracker. These workflows ensure code quality, enforce testing standards, and protect our deployment branches.

## Available Workflows

### 1. `ci.yml` (Continuous Integration)
**Purpose:** validates that every code change is buildable, clean, and bug-free before it can be merged.

- **Triggers:**
  - **Pull Requests:** Runs on any PR targeting `main` or `staging`.
  - **Push:** Runs whenever code is merged into `staging`.
- **Jobs:**
  - **Linting:** Checks for code style and formatting issues across all workspaces.
  - **Build:** Verifies that the Frontend and Backend can compile without errors.
  - **Test:** Runs unit tests for all apps.

## Monorepo Configuration
This workflow is designed for our Monorepo structure (`apps/backend`, `apps/frontend`).

It relies on the **Root `package.json`** to act as the orchestrator. For the CI to detect your code, your package scripts must support workspaces:

```json
// Root package.json
"scripts": {
  "test": "npm test --workspaces --if-present",
  "lint": "npm run lint --workspaces --if-present",
  "build": "npm run build --workspaces --if-present"
}