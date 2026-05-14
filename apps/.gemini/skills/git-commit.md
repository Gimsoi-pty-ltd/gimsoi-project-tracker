# Git Commit Skill

**Activates:** Step 8 of feature-cycle.md (after Final Report is saved)
**Input:** PHASE_LOG (files modified per phase) + feature name + branch name
**Output:** Ordered list of `git add` + `git commit` commands ready to copy-paste

---

## Protocol

### 1. Determine Branch Name

Use the format:
```
feat/<feature-name>
```
Example: `feat/user-admin`

If the branch already exists (user has been committing during the cycle), skip branch creation.

Output:
```
Branch: feat/<feature-name>
git checkout -b feat/<feature-name>
```

---

### 2. Group Files by Commit Layer

Extract all modified files from PHASE_LOG and group them in this order:

| Commit | Files | Message Pattern |
|---|---|---|
| 1 | `constants/`, `lib/` | `feat(<scope>): add permissions and constants` |
| 2 | `services/` | `feat(<scope>): implement service layer` |
| 3 | `schemas/` | `feat(<scope>): add request validation schemas` |
| 4 | `controllers/`, `routes/`, `server.js` | `feat(<scope>): implement API endpoints` |
| 5 | `utils/`, `middleware/` (if modified as part of feature) | `feat(<scope>): add utilities and middleware` |
| 6 | `tests/api/` | `test(<scope>): add API integration tests` |
| 7 | `apps/.gemini/history/` | `docs(<scope>): add PRD, phase plan and final report` |
| 8 | `package.json`, `package-lock.json` | `chore: update dependencies` |

Files in `middleware/` that are **hotfixes** (not planned in the phase) get their own commit:
```
fix(middleware): <one-line description of the fix>
```

---

### 3. Output Format

```
## Git Commit Plan — <feature-name>
Branch: feat/<feature-name>

# Create branch (skip if already on it)
git checkout -b feat/<feature-name>

# Commit 1: Constants & Permissions
git add <file1> <file2>
git commit -m "feat(<scope>): <description>"

# Commit 2: Service Layer
git add <file>
git commit -m "feat(<scope>): <description>"

...

# Push
git push -u origin feat/<feature-name>
```

---

## Rules

- Scope is the lowercase feature name. Example: `user`, `sprint`, `task`.
- Never combine files from different architectural layers in one commit.
- Never include `lib/generated/` or `node_modules/` in any commit.
- `package-lock.json` always goes with `package.json` in the same commit.
- Do not suggest `git push --force` under any circumstance.
