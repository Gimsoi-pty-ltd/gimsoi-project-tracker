# Prisma Workflow Skill

**Activates:** Whenever Prisma schema changes or migrations are mentioned in any phase plan

---

## Schema Change Protocol

Schema changes are **always isolated to their own phase**. No business logic changes
in the schema phase. No schema changes in any logic phase. This is not negotiable.

### Schema Phase Sequence
1. Edit `prisma/schema.prisma` only
2. Run `npx prisma generate`
3. Run `npm run test:api`
4. PASS: proceed to next phase
5. FAIL: revert schema change — `git checkout prisma/schema.prisma && npx prisma generate`

### Migration Naming Convention
Migration names are snake_case, describing the change precisely:
```
add_task_priority_field
rename_profile_pic_to_avatar_url
add_project_end_date_nullable
add_sprint_velocity_index
remove_legacy_status_enum
```
Never use: `migration1`, `update_schema`, or timestamp-only names.

---

## prisma generate — When and Why

`npx prisma generate` must run:
- After every edit to `prisma/schema.prisma`
- Before starting the app (`package.json` already has `"postinstall": "prisma generate"`)
- Before running `npm run test:api` if the schema changed in the current session

Forgetting `prisma generate` after a schema change causes `PrismaClientInitializationError`
at runtime because `lib/generated/` is out of sync with the schema. This error is silent
in AppSail logs — the process exits without a meaningful message.

---

## P2025 — Record Not Found

Thrown by Prisma when `findUnique`, `update`, or `delete` targets a non-existent record.

**Pattern (ESM syntax — this project's custom Prisma output):**
```js
import pkg from '../lib/generated/prisma/index.js';
const { Prisma } = pkg;

export async function deleteTask(taskId, userId) {
  try {
    return await prisma.task.delete({
      where: { id: taskId, assignedUserId: userId },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      // Record does not exist — surface as 404, not 500
      throw Object.assign(new Error('Task not found'), { statusCode: 404 });
    }
    throw error; // Re-throw unexpected errors with full context
  }
}
```

> ⚠️ **Do NOT use** `import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js'`.
> That path does not exist under this project's custom Prisma output (`lib/generated/prisma/`).
> The working pattern used in `utils/prismaErrors.js` is the authoritative reference.

---

## P2002 — Unique Constraint Violation

Thrown when an `email`, `slug`, or `@unique` field already exists in the database.

**Pattern (ESM syntax — this project's custom Prisma output):**
```js
import pkg from '../lib/generated/prisma/index.js';
const { Prisma } = pkg;

export async function createClient(data) {
  try {
    return await prisma.client.create({ data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // error.meta.target is the array of field(s) that caused the conflict
      const field = error.meta?.target?.[0] ?? 'field';
      throw Object.assign(
        new Error(`A client with this ${field} already exists`),
        { statusCode: 409 }
      );
    }
    throw error;
  }
}
```

> ⚠️ **Do NOT use** `import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js'`.
> That path does not exist under this project's custom Prisma output (`lib/generated/prisma/`).
> The authoritative reference is `utils/prismaErrors.js`.

---

## Never Use Raw SQL

`prisma.$queryRaw` and `prisma.$executeRaw` are permanently prohibited.
Reasons:
- Bypasses multi-tenant row-level isolation enforced in service layer queries
- Bypasses Prisma's type safety — no compile-time guarantee of result shape
- Introduces SQL injection risk if template literals are not used correctly

If a query cannot be expressed in Prisma's query API, STOP and surface the
constraint to the user. Do not work around it with raw SQL.

---

## Prisma Client Import (ESM)

The Prisma client is mapped in `package.json` imports:
```json
"imports": {
  "@prisma/client": "./lib/generated/prisma/index.js"
}
```

Import it as:
```js
import { PrismaClient } from '@prisma/client';
```

The Prisma client instance should be a singleton. Use the shared instance from
`lib/` (or wherever the project initialises it) — never instantiate a new
`PrismaClient()` in a service file directly unless the project pattern requires it.
Check `lib/` for the existing client initialisation before adding a new one.
