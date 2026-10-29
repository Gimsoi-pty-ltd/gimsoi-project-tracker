# Task 5 — Zod Validation and Error Handling

Task 5, why I added them, and what happened when I tested them.

## What I was trying to do

Task 5 asks me to make sure bad requests get caught with Zod before they reach the business logic, and that errors come back in a clear, consistent shape. I wanted to do this **without touching any file that already exists** in the backend, so I wouldn't risk breaking something a teammate is also working on. Everything below is a brand new file. Nothing old was edited.

## The files I added, and why

### `schemas/auth.schema.js`

I added this because there was no Zod schema at all for signup, login, email verification, forgot-password, or reset-password. Each one checks the obvious things: email has to look like an email, password has to be at least 8 characters, full name can't be empty, and so on. I wrote a message for every rule so whoever gets the error knows exactly what was wrong, not just "invalid input."

### `schemas/zoho.schema.js`

Zoho's API sends project data with inconsistent field names, and the code that reads it (`zohoTransformation.service.js`) already knows how to deal with that by checking a few possible names for the same field. So I didn't try to lock down every field — I just made sure:
- `transformProjectSchema` rejects anything that isn't a plain object (no `null`, no array, no string, no number can sneak through).
- `transformProjectsSchema` accepts either a plain array of projects, or an object like `{ projects: [...] }`, since the route code already supports both shapes.

### `schemas/common.schema.js`

This is a small shared helper, `uuidParam(name)`, that checks a route parameter is a real UUID. I added it so a broken ID (like `"abc123"`) can be told apart from a UUID that's just not in the database — one is a bad request (400), the other is a real 404. I didn't wire it into any route yet, since that would mean editing route files, which was off-limits for this pass.

### `utils/formatZodError.js`

This turns whatever Zod gives me into the same shape every time: `{ message, errors: [{ field, message }] }`. I added it as its own file instead of writing this logic inline wherever I need it, so there's one place to fix it if the error shape ever needs to change.

## The test I added, and why

I added `tests/unit/task5-validation.test.js` with 18 small tests that call the four files above directly — no server, no database. I did it this way on purpose: the existing test setup (`npm run test:api`) needs a real test database and starts the whole server, which is a lot of moving parts for something as simple as "does this schema reject bad input." A unit test that just imports the schema and calls `.parse()` on it tells me the same thing in milliseconds, with nothing else that can go wrong.

To run these without the normal test setup getting in the way (it insists on a test database before anything runs, even for a file like this), I added `playwright.unit.config.js` — a second, separate Playwright config that only looks at `tests/unit` and skips the database setup and the server entirely. This is also a new file; I didn't touch `playwright.config.js`.

What the tests check, in plain terms:
- Missing a required field (like no password) gets rejected.
- A badly formatted field (like `"not-an-email"`) gets rejected.
- A field that's too short (like a 5-character password) gets rejected.
- A good, correct payload is accepted.
- `transformProjectSchema` rejects `null`, a string, and an array, but accepts a normal object with any field names.
- `transformProjectsSchema` accepts both shapes it's supposed to, and rejects an object that doesn't match either.
- A malformed UUID is rejected by `idParamSchema`, a real UUID passes.
- `formatZodError` turns a validation failure into `{ field, message }` pairs.

## What I ran, and what came back

```
npx playwright test --config=playwright.unit.config.js --reporter=list
```

Result: **18 passed, 0 failed.**

## A real bug I found while testing (and fixed)

The first time I ran the tests, one failed:

```
maps nested path to a dotted field name
Expected: true
Received: false
```

This wasn't a flaky test — it pointed at a real problem. `transformProjectsSchema` is a Zod "union" (it accepts shape A *or* shape B). When neither shape matches, Zod 4 doesn't put the real error in the normal place (`issues`); it nests the actual per-branch errors inside `issue.errors`. My `formatZodError.js` was only looking at the normal place, so for this one kind of schema it would've sent back a useless `"Invalid input"` message with no field name — exactly the kind of unhelpful error Task 5 is supposed to prevent.

**What I did:** I added a small step in `formatZodError.js` that checks for this nested shape (`code === "invalid_union"`) and flattens it out before building the `{ field, message }` list.

**Why:** Fixing it felt right rather than leaving it, since this file's whole job is to make errors clear, and this was a case where it would have silently done the opposite. It's still a new file I added this pass, so fixing a bug inside it doesn't break the "don't touch existing files" rule.

After that fix, all 18 tests passed.

## I also tested the actual application, not just the schemas

The unit tests above only check the schema files on their own. To be sure, I also started the real backend (`node server.js`) in production mode (`NODE_ENV=production`), pointed at the isolated test database from `.env.test` — never the real production database — and sent it real requests with `curl` on a separate port so it couldn't collide with anything else running.

What I checked, and what came back:
- `POST /api/auth/login` with broken JSON → **400**, `{ "success": false, "message": "..." }`. No stack trace.
- `POST /api/auth/signup` with missing fields → **400**, `{ "success": false, "message": "All fields are required" }`. No stack trace.
- `GET /api/does-not-exist` (a route that doesn't exist) → **404**, but as Express's own plain HTML error page, not the app's usual `{ success, message }` JSON shape. This is how `server.js` already behaved before I touched anything — there's no catch-all 404 handler — so I'm noting it here rather than fixing it, since fixing it would mean editing `server.js`, an existing file.

No stack trace, file path, or database detail showed up in any response while running as production. That's the one acceptance criterion ("internal stack traces are not sent to clients in production") I could actually watch happen in the running app instead of just assuming it from reading the code. Once I was done checking, I stopped the test server.

## What's still missing

None of these four files are wired into the live app yet. `auth.route.js` and `zoho.route.js` don't call `validate()` with these schemas, and no route uses `idParamSchema`. Doing that means editing those existing route files, which I held off on for this pass. The schemas and the formatter are tested and ready to be wired in whenever that's the next step.
