# Pre-Deploy Checklist Workflow

**Trigger:** `/pre-deploy`

Executes the Zoho Catalyst AppSail pre-deployment sequence for Gimsoi backend.
Each step has a PASS condition and a FAIL action. A single FAIL blocks deployment.

---

## Step 1 — Baseline Test Gate

**Command:**
```bash
npm run test:api
```

**PASS condition:** All tests pass (0 failures)

**FAIL action:**
```
⛔ DEPLOYMENT BLOCKED — Step 1
npm run test:api has failures. Deployment cannot proceed.
Fix all failing tests and re-run /pre-deploy.
```

---

## Step 2 — Start Script Verification

**Check:** `package.json` `"start"` script must be `"node server.js"` — not `nodemon`.

**Command:**
```bash
node -e "import('./package.json', {assert:{type:'json'}}).then(m => console.log(m.default.scripts.start))"
```
Or simply read `package.json` and confirm.

**PASS condition:** `"start": "node server.js"`

**FAIL action:**
```
⛔ DEPLOYMENT BLOCKED — Step 2
The "start" script is set to: <current value>
AppSail requires: "node server.js"
Fix package.json scripts.start and re-run /pre-deploy.
```

---

## Step 3 — Environment Variable Audit

**Check:** Every variable listed in `.env.example` must be confirmed as set in
the Catalyst AppSail environment config for the target environment.

Required variables (from `.env.example`):
- `DATABASE_URL`
- `JWT_SECRET`
- `CSRF_SECRET`
- `CORS_ORIGIN`
- `NODE_ENV` (must be `production`)
- `PORT`

**PASS condition:** All variables present and non-empty in Catalyst config.

**FAIL action:**
```
⛔ DEPLOYMENT BLOCKED — Step 3
Missing env vars in Catalyst config: [list missing vars]
Set these in the Catalyst dashboard under AppSail → Environment → Config Variables.
Do NOT add them to .env — Catalyst does not read .env files in AppSail.
```

---

## Step 4 — Prisma Generate Check

**Purpose:** Ensure the Prisma client in `lib/generated/` is in sync with `schema.prisma`.

**Command:**
```bash
npx prisma generate
```

**PASS condition:** Command exits 0 with no warnings about schema drift.

**FAIL action:**
```
⛔ DEPLOYMENT BLOCKED — Step 4
prisma generate failed or reported schema drift.
Error: <output from command>
Check prisma/schema.prisma and lib/generated/ for inconsistencies.
```

---

## Step 5 — ESM Compliance Spot-Check

**Purpose:** Catch any `require()` calls or `.cjs` files that would cause
`ERR_REQUIRE_ESM` crash on AppSail startup.

**Command:**
```bash
grep -r "require(" --include="*.js" . --exclude-dir=node_modules --exclude-dir=lib
```

**PASS condition:** No results returned.

**FAIL action:**
```
⛔ DEPLOYMENT BLOCKED — Step 5
require() found in source files:
<grep output>
Convert all require() calls to ESM import statements before deploying.
```

---

## Step 6 — Catalyst Deploy

**Command:**
```bash
catalyst deploy
```

**PASS condition:** Command exits 0. AppSail reports the deployment as active.

**FAIL action:**
```
⛔ DEPLOYMENT BLOCKED — Step 6
catalyst deploy exited with non-zero code.
Output: <command output>
Common causes:
  - Missing env var (check Step 3)
  - ESM/CJS conflict (check Step 5)
  - Build artifact missing (check catalyst deploy logs)
Run: catalyst appslot logs --tail to view live startup logs.
```

---

## Step 7 — Health Endpoint Verification

**Purpose:** Confirm the deployed app is accepting requests.

**Command:**
```bash
curl -s -o /dev/null -w "%{http_code}" https://<catalyst-app-domain>/api/health
```

**PASS condition:** Returns `200` within 60 seconds of deployment completing.

**FAIL action:**
```
⛔ DEPLOYMENT BLOCKED — Step 7
Health endpoint did not return 200.
Response code: <code>
Actions:
  1. Run: catalyst appslot logs --tail
  2. Look for: ERR_REQUIRE_ESM, PrismaClientInitializationError, or missing env var errors
  3. If logs show DATABASE_URL issue: verify Catalyst env config and redeploy
```

---

## Final Status

If all 7 steps PASS:

```
✅ DEPLOYMENT READY
All pre-deploy checks passed.
Feature: <feature-name>
Deployed at: <ISO timestamp>
Health: GET /api/health → 200

Reminder: The agent does not run git push. If you want to push the feature branch:
  git push origin <branch-name>
Run that command yourself after confirming deployment is stable.
```
