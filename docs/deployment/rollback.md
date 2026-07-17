# Rollback Plan

## What must be done

1. Find the last known-good CI run for the commit you want to roll back to.
   ```
   gh run list --repo <owner>/<repo> --workflow "CI Pipeline" --branch main --status success
   ```
   Copy its run ID (the number in the run URL, or the `databaseId` field).

2. Redeploy that run's artifacts.
   ```
   gh workflow run "Deploy to Zoho Catalyst" -f ci_run_id=<RUN_ID>
   ```
   Or from the GitHub UI: Actions tab, "Deploy to Zoho Catalyst", "Run workflow", enter the run ID.

3. Watch the run in the Actions tab. If the smoke test step fails, the whole job fails and nothing is left silently broken. If it succeeds, the rollback is done.

If you leave `ci_run_id` blank, it redeploys the latest successful CI run on `main` instead. Use that only if you want to retry the current deploy, not to roll back.

## How to verify the rollback worked

- Open the "Deploy to Zoho Catalyst" run in the Actions tab and confirm every step is green, including "Smoke test deployment".
- Manually check the app is back to normal: load the frontend URL and hit `/api/health` on the backend URL.
- If the smoke test failed, the deploy did not go live. Do not tell anyone it's rolled back until the run is green.

## Why the system works this way

Deploy never rebuilds the app from source. It downloads the exact `backend-package` and `frontend-package` files that CI already built and tested, and deploys those. This means "roll back" is just "redeploy an older, already-tested build", not "revert code and rebuild under pressure while something is on fire".

CI artifacts are only kept for 14 days (`retention-days: 14` in `ci.yml`). If the run you need is older than that, there is nothing to download. In that case you must check out the old commit and re-run CI on it first, then follow the steps above with the new run ID.

## Where to find more info

- `.github/workflows/ci.yml`: builds and tests the app, produces the artifacts.
- `.github/workflows/deploy.yml`: downloads artifacts and deploys them, including the `ci_run_id` input used above.
- `scripts/smoke-test.sh`: what gets checked after every deploy.

## What this does not cover

This is a manual rollback. Nothing here automatically redeploys the previous version if a deploy fails. If that is ever needed, it would require tracking the last known-good run before each deploy and adding an automatic rollback step, which does not exist yet.
