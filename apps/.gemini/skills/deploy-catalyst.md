# Deploy Catalyst Skill

**Activates:** When deployment is mentioned, or when `/pre-deploy` is triggered

---

## AppSail Requirements

### Start Script
The AppSail start command must be:
```
node server.js
```
`nodemon` is a dev tool. It must never be the AppSail start command.
Verify in the Catalyst dashboard: AppSail → Functions → server → Start Command.

### Environment Variables
Catalyst AppSail does **not** read `.env` files. All environment variables must
be configured in the Catalyst dashboard under:
`AppSail → server → Environment → Config Variables`

Required variables (cross-reference with `apps/backend/.env.example`):
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Catalyst Data Store or external) |
| `JWT_SECRET` | Secret for signing JWT tokens — minimum 32 chars |
| `CSRF_SECRET` | Secret for CSRF double-submit cookie — minimum 32 chars |
| `CORS_ORIGIN` | Allowed origin (e.g. `https://app.gimsoi.com`) |
| `NODE_ENV` | Must be `production` |
| `PORT` | Port AppSail binds to (usually `9000` for Catalyst) |

If any variable is missing, the app starts and immediately crashes silently.
The health check times out. There is no obvious error in `catalyst deploy` output.

---

## Common Failure Modes

### ERR_REQUIRE_ESM
**Symptom:** AppSail health check times out; logs show `ERR_REQUIRE_ESM`
**Cause:** A `require()` call in a source file with `"type": "module"`
**Diagnosis:** `grep -r "require(" --include="*.js" . --exclude-dir=node_modules`
**Fix:** Convert `require()` to `import`

### PrismaClientInitializationError
**Symptom:** Process exits immediately after deploy
**Cause:** `prisma generate` was not run, or `lib/generated/` is out of sync
**Diagnosis:** `catalyst appslot logs --tail` — look for `PrismaClientInitializationError`
**Fix:** Run `npx prisma generate` locally, commit `lib/generated/` changes (if tracked), redeploy

### Missing DATABASE_URL
**Symptom:** App starts, all routes return 500
**Cause:** `DATABASE_URL` not set in Catalyst environment config
**Diagnosis:** Logs show `Invalid \`prisma.model.findX()\` invocation` or connection refused
**Fix:** Set `DATABASE_URL` in Catalyst dashboard, redeploy

### CORS Error on Frontend
**Symptom:** Frontend gets CORS error in browser console
**Cause:** `CORS_ORIGIN` set to wrong value (e.g. trailing slash, wrong domain)
**Fix:** Set `CORS_ORIGIN` to exact origin without trailing slash

---

## The catalyst deploy Sequence

```bash
# 1. Confirm start script is correct
cat package.json | grep '"start"'
# Expected: "start": "node server.js"

# 2. Confirm prisma generate is up to date
npx prisma generate

# 3. Run the gate
npm run test:api
# All tests must pass before deploying

# 4. Deploy
catalyst deploy

# 5. Tail logs to confirm startup
catalyst appslot logs --tail

# 6. Verify health endpoint
curl -s -o /dev/null -w "%{http_code}" https://<your-catalyst-domain>/api/health
# Expected: 200
```

---

## Health Endpoint

`GET /api/health` is defined in `routes/health.route.js`.
It must return `200` with a JSON body. A non-200 response after deploy means
the app is not serving requests. Do not declare deployment successful until
this endpoint returns `200`.

---

## Log Check Commands

```bash
# Tail live logs
catalyst appslot logs --tail

# View last N lines
catalyst appslot logs --lines 100

# Filter for errors
catalyst appslot logs --tail | grep -i "error\|ERR\|fatal"
```

---

## Deployment Gate

The agent runs `/pre-deploy` before every `catalyst deploy`.
If `/pre-deploy` reports `DEPLOYMENT BLOCKED`, `catalyst deploy` is not run.
The agent waits for the user to resolve the blocking issue and re-run `/pre-deploy`.

**The agent never runs `git push` as part of the deployment workflow.**
