# Task 5 — Zod Validation and Error Handling

This document explains the work I did for Task 5. My job was to check every request coming into the API, reject bad data with a clear message, and make sure errors look the same everywhere.

## What Task 5 asked for

- Zod schemas for request bodies, route params, and query strings.
- Validate data before it reaches business logic.
- Standard validation errors and API error responses.
- Handle database and application errors the same way everywhere.
- Never leak stack traces to the client in production.

## What I built

### 1. Zod schemas (`schemas/` folder)

I made one schema file per resource (`auth.schema.js`, `task.schema.js`, `project.schema.js`, `sprint.schema.js`, `phase.schema.js`, `label.schema.js`, `comment.schema.js`, `client.schema.js`, `report.schema.js`, `projectMember.schema.js`, `user.schema.js`, `activity.schema.js`, `analytics.schema.js`, `search.schema.js`, `zoho.schema.js`), plus a shared `common.schema.js` for things every route needs, like checking a route param is a real UUID.

I did this because keeping every rule in one schema file per resource makes it easy for anyone on the team to find the rule for a field, instead of hunting through controller code.

### 2. A reusable validation middleware (`middleware/validate.middleware.js`)

I wrote one small function, `validate(schema, source)`, that:
1. Takes a Zod schema and tells it to check `req.body`, `req.query`, or `req.params`.
2. If the data is bad, it throws a `ZodError` straight to `next(err)`.
3. If the data is good, it replaces the request data with the cleaned-up version (so defaults like `priority: "MEDIUM"` or type coercion like turning `"true"` into a real boolean actually show up in the controller).

I did this instead of calling `schema.parse()` by hand inside every controller because:
- It's one line per route, so every route looks the same.
- A new developer only has to learn the pattern once.
- It can't be forgotten halfway through, unlike manual checks scattered in controller code.

### 3. One global error handler (`server.js`)

I kept the error handler as a single `app.use((err, req, res, next) => {...})` at the bottom of `server.js`. It checks what kind of error came in and turns it into the same response shape every time:

```json
{ "success": false, "message": "...", "errors": [ { "field": "...", "message": "..." } ] }
```

- If it's a `ZodError`, I send it through `formatZodError.js` to turn Zod's internal issue list into a simple `{ field, message }` array.
- If it's a Prisma database error, I send it through `prismaErrors.js` (see below).
- If nothing matches, it's a plain 500. In that case, **in production only**, I replace the real error message with a generic one ("An unexpected server error occurred...") so nobody outside the team ever sees a stack trace or a database detail. I still `console.error` the real error so the team can debug it from the server logs.

### 4. Standard database error mapping (`utils/prismaErrors.js`)

Prisma gives you a error "code" like `P2002` or `P2025` instead of a normal HTTP status. I wrote `handlePrismaError()` to translate the common ones into errors the rest of the app already understands:

| Prisma code | Meaning | What I turn it into |
|---|---|---|
| P2002 | Unique value already used | 409 Conflict |
| P2025 | Record not found | 404 Not Found |
| P2003 | Related record missing | 409 Conflict |
| P2009 / P2019 | Bad data sent to the database | 400 Bad Request |

I did this so a controller never has to know what a "P2002" is. It just lets the error bubble up with `next(err)`, and the global handler turns it into the right status code automatically.

## Errors I found and how I fixed them

### Error 1: Duplicate validation inside controllers

**What was wrong:** Some controllers (`comment.controller.js`, `label.controller.js`) were calling `schema.parse(req.body)` a second time, inside the controller, even though the route already had `validate(schema)` on it. This meant the same data got checked twice, and if someone changed the schema in one spot they could forget the other.

**What I did:** I removed the manual `.parse()` calls from inside the controllers and let the route-level `validate()` middleware do the only validation. The controller now just trusts `req.body` because the middleware already cleaned it.

**Why I chose this fix:** Having validation happen in exactly one place (the route) is easier to trust and easier to test. If I kept both, a future bug fix to the schema might only get applied in one of the two places by mistake.

### Error 2: Inconsistent response shape

**What was wrong:** Some controllers returned `{ status: "success", data }` and others returned `{ success: true, data }`. Having two different "it worked" shapes makes the frontend write extra code to handle both.

**What I did:** I changed every controller I touched (`comment`, `label`, `projectMember`, `activity`) to use `success: true` so it matches the same `success` field the error responses already use (`success: false`).

**Why I chose this fix:** The error responses already used `success: false`. Matching that on the success side means the frontend can check `response.success` everywhere, instead of remembering which endpoint uses which word.

### Error 3: A malformed ID and a missing ID looked the same to the client

**What was wrong:** Before my change, sending a broken ID (like `"non-existent-id-xyz"`, which isn't even a real UUID shape) to `GET /api/projects/:id/progress` returned the same 404 as sending a real UUID that just doesn't exist in the database. That's misleading — one is "you typed something wrong" and the other is "that record isn't there."

**What I did:** I added `idParamSchema` (a UUID check) on the route params, so a badly-shaped ID now fails validation and returns 400 before the code even tries to look it up. A well-formed UUID that simply isn't in the database still correctly returns 404. I also split the existing test into two separate tests so both cases are checked on their own.

**Why I chose this fix:** 400 and 404 mean different things to an API client. 400 says "fix your request." 404 says "your request was fine, but that thing doesn't exist." Mixing them up makes debugging harder for whoever is calling the API.

### Error 4: `GET /api/analytics/ai-context` had no validation at all

**What was wrong:** This endpoint takes five query params (`projectId`, `startDate`, `endDate`, `cursor`, `limit`), but none of them went through a Zod schema. They went straight into `middleware/analyticsScope.middleware.js` (which does `new Date(startDate)` directly) and then into raw SQL in `services/analytics.service.js` (`t."projectId" = ${projectId}`, `LIMIT ${limit}`, etc.). A bad `projectId` (not a real UUID) or a bad date string wouldn't get caught by my schemas — it would travel all the way to Postgres and come back as a raw database error. `utils/prismaErrors.js` only catches `PrismaClientKnownRequestError` (the kind Prisma throws for its own query-builder methods), not the error type a raw `$queryRaw` call throws on bad input. So instead of a clean 400, the client would get a 500 with no useful message.

**What I did:** I added `aiContextQuerySchema` to `schemas/analytics.schema.js`:
- `projectId` and `cursor` must be real UUIDs (optional).
- `startDate` and `endDate` must be real dates — I used `z.coerce.date()` so a bad string like `"not-a-date"` fails validation instead of silently becoming `Invalid Date`.
- `limit` comes in as a string from the query string, so I parse it with `.transform()`, then check it's a whole number between 1 and 50 with `.pipe()`. If it's missing, it defaults to 10 — matching what the controller already defaulted to before.

Then I added `validate(aiContextQuerySchema, 'query')` to the route in `routes/analytics.route.js`, right before `injectAnalyticsScope`, same as every other validated route. I also deleted the controller's own `Math.min(parseInt(rawLimit, 10) || 10, 50)` line in `controllers/analytics.controller.js`, since the schema already guarantees `limit` is a clean number in range by the time the controller sees it.

**Why I chose this fix:** Same reasoning as the rest of this document — catch bad input at the edge, before it reaches the database, so the client always gets a clear 400 instead of a confusing 500. I checked this against all 6 existing tests in `tests/api/analytics.spec.js` plus the `ai-context` call in `tests/api/e2e-flow.spec.js` by hand, and none of them send a value that the new schema would reject, so this didn't break anything already passing.

## Why I chose Zod and this overall approach

- **Validate at the edge, not inside business logic.** I put every check in middleware that runs before the controller, so the controller code only ever sees clean, already-typed data. This keeps the business logic simple and focused on what it's actually supposed to do.
- **One error shape everywhere.** Whether the problem is a bad request, a missing record, or a real server crash, the client always gets back `{ success: false, message, errors? }`. That means the frontend only has to write one piece of error-handling code, not one per endpoint.
- **Hide internals in production, but keep them for debugging.** I only hide the real error message when `NODE_ENV === "production"`. Locally and in tests, the real message still shows up, which makes debugging fast. In production, nothing internal (table names, SQL text, stack traces) ever reaches a real user.

## How to add a new schema

If you're adding a new route and it takes a body, params, or a query string, here's the steps I follow. I'll use a made-up example: a new `POST /api/widgets` endpoint.

**Step 1: Open (or create) the schema file for that resource.**

Schemas live in `schemas/`. One file per resource, named `<resource>.schema.js`. If `widget.schema.js` doesn't exist yet, I create it.

**Step 2: Write the Zod schema.**

```js
import { z } from 'zod';

export const createWidgetSchema = z.object({
    name: z.string().min(1, 'Widget name is required').max(100),
    projectId: z.string().uuid('projectId must be a valid UUID'),
    isActive: z.boolean().optional().default(true),
});
```

A few rules I stick to, because this is what the rest of the schemas already do:

- Every required field gets its own error message, so the client knows exactly what's wrong (`"Widget name is required"`, not just `"Invalid input"`).
- Any ID field that points at another record (like `projectId`) uses `.uuid()`, because the database stores IDs as UUIDs. This is what makes a broken ID fail with 400 instead of looking like a 404 (see "Error 3" above).
- Fields that aren't required use `.optional()`. Fields that can come back as `null` from the database also add `.nullable()`.
- If I'm writing an "update" schema, I copy the pattern from `task.schema.js`'s `updateTaskSchema`: every field is `.optional()`, and I add a `.refine()` so an empty update body (someone calling PATCH with nothing to change) gets rejected.

**Step 3: Export it, then import it in the route file.**

```js
import { validate } from '../middleware/validate.middleware.js';
import { createWidgetSchema } from '../schemas/widget.schema.js';
```

**Step 4: Add `validate()` to the route, before the controller.**

```js
router.post('/', writeLimiter, verifyToken, authorize('CREATE_WIDGET'), requireCSRF, validate(createWidgetSchema), createWidget);
```

The second argument to `validate()` controls what gets checked — leave it out for `req.body` (the default), or pass `'params'` or `'query'`. If a route needs more than one checked (for example, a UUID in the URL *and* a body), I add `validate()` twice in the chain, like `label.route.js` does:

```js
router.patch('/:id', ..., validate(idParamSchema, 'params'), validate(updateLabelSchema), updateLabel);
```

**Step 5: Don't validate again inside the controller.**

Once `validate()` is on the route, the controller can just read `req.body` / `req.query` / `req.params` directly — the middleware already cleaned it up. Adding a second `schema.parse()` inside the controller is exactly the mistake I removed in "Error 1" above, so I don't repeat it.

**Step 6: Test it.**

I check three things manually (or in a Playwright test, which is Task 8's job, but I still check it myself before handing it off):
- Missing a required field → should return 400 with a useful message.
- A wrong type or format (like a non-UUID string where an ID is expected) → should return 400, not a 500 or a silent pass-through.
- Good data → should reach the controller and work like normal.

## What I have not fixed yet (small cleanup, not a bug)

Two small inconsistencies I found while reviewing my own work, left over from how `controllers/analytics.controller.js` was written before I touched it:

1. **`teamAnalyticsSchema` is defined twice** — once in `schemas/analytics.schema.js` (where every other schema lives) and again, word-for-word, inline inside `controllers/analytics.controller.js`. The route actually imports the controller's copy. They happen to match today, but if someone edits one copy and forgets the other, they'll quietly drift apart.
2. **`ingestHealthScore` doesn't use the `validate()` middleware** — it does a manual `await import('../schemas/analytics.schema.js')` plus `healthScoreSchema.parse(req.body)` inside the controller itself, instead of `validate(healthScoreSchema)` on the route like every other endpoint in this app. It still works correctly (the error still reaches the global handler), it's just not consistent with the pattern I used everywhere else, and the per-request dynamic import is unnecessary.

Neither of these causes a wrong status code or a bad response today — they're tidiness issues, not the kind of gap Error 4 was.
