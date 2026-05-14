## Fit Analysis — User Administration

### Axis 1 — Schema Impact: NO
- Existing `User` model already contains `fullName`, `email`, `role`, and `avatarUrl`.
- Role enum values: `ADMIN`, `PM`, `INTERN`, `CLIENT`.
- No new fields or models required for this feature.

### Axis 2 — Route Collisions: NO
- No existing `users` router.
- Path prefix `/api/users` is currently unclaimed.
- `GET /api/clients` already exists and is stable.

### Axis 3 — New Dependencies: YES
- **multer:** Required for multipart avatar upload handling (Axis 3: YES).
- Must flag for user review before `npm install`.

### Axis 4 — Layer Violations: NO
- The feature can follow the standard Controller -> Service -> Prisma pattern.
- Admin creation logic can be abstracted into `auth.service.js` or a new `user.service.js`.

### Axis 5 — Test Surface: 2 at risk
- `tests/api/rbac.spec.js` — existing RBAC tests may need to be extended or might conflict with new routes.
- `tests/api/auth.spec.js` — login/signup logic shared with user creation.

### Affected Files
- `apps/backend/server.js` (Register new router)
- `apps/backend/routes/user.route.js` [NEW]
- `apps/backend/controllers/user.controller.js` [NEW]
- `apps/backend/services/user.service.js` [NEW]
- `apps/backend/schemas/user.schema.js` [NEW]
- `apps/backend/utils/upload.js` [NEW] (Multer config)

### Preliminary Impact Score: M
- Classified M because it requires a new dependency (`multer`) and touches multiple files across 3 layers (Service, Controller, Route).
- No schema change, which keeps it from being L.
