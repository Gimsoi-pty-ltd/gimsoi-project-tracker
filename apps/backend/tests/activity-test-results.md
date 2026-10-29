# Activity API tests: plan and results

**Status:** Test cases written; not run yet.  
**Test file:** `tests/api/activity.spec.js`  
**Feature files reviewed:** `routes/activity.route.js`, `controllers/activity.controller.js`, and `schemas/activity.schema.js`.

## What the tests check

1. A signed-in user can create an activity and find it in their own activity list.
2. An unauthenticated request cannot list activities (`401`).
3. An empty or whitespace-only action is rejected (`400`).
4. A request with an invalid CSRF token is rejected (`403`).
5. A user cannot retrieve another user's activities (`403`).
6. A project non-member cannot create an activity attached to another project's task (`403`).
7. Falsy values such as `0` and `false` are stored as values, not changed to `null`.

## Initial code review findings (not test results)

These are predictions from reading the controller and schema. Run the tests against a disposable database before recording them as confirmed results.

- **Likely failure: whitespace-only action.** The schema checks `min(1)` but does not trim whitespace, so a value such as `"   "` may pass validation.
- **Likely failure: task membership.** `createActivity` does not check project membership when `taskId` is supplied, so a user may be able to attach an activity to a task in a project they cannot access.
- **Likely failure: `0` and `false`.** The controller uses truthiness checks when converting `oldValue` and `newValue`; those values are converted to `null` instead of strings.

## Results to fill in after a safe test run

| Check | Expected | Actual | Result / notes |
|---|---|---|---|
| Create and retrieve own activity | `201`, then `200` and activity is present | Not run | |
| Unauthenticated list | `401` | Not run | |
| Blank action | `400` | Not run | |
| Invalid CSRF token | `403` | Not run | |
| Read another user's activities | `403` | Not run | |
| Create activity on non-member task | `403` | Not run | |
| Preserve `0` and `false` values | Stored as `"0"` and `"false"` | Not run | |

## Safe test-running reminder

The Playwright global setup truncates application tables before running the API suite. Use a separate disposable test database. Do not run `npm run test:api` while `DATABASE_URL` points to your normal or shared hosted database.

From `apps/backend`, run the activity test file only with:

```powershell
npx playwright test tests/api/activity.spec.js
```

After running it, replace each `Not run` entry above with the observed status and any useful failure detail. Keep failed tests visible until the behavior is fixed and the same tests pass.
