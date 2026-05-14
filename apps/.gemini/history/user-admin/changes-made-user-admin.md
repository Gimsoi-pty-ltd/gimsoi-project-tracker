# Changes Made: `feat/user-admin`

This update implements a comprehensive User Management and Administration system. We have added granular administrative controls for user lifecycles and enabled self-service profile management, including multipart image support.

### Features Added

#### 1. Administrative User Management (Admin Only)
- **Global User Listing:** Implemented `GET /api/users` with cursor-based pagination and restricted access to the `ADMIN` role.
- **Controlled User Creation:** Added `POST /api/users` allowing admins to provision accounts with explicit roles (`ADMIN`, `PM`, `INTERN`, `CLIENT`), bypassing standard self-registration locks.
- **Role Elevation/Demotion:** Implemented `PATCH /api/users/:id/role` for administrative role updates, including safety logic to prevent self-lockout.

#### 2. Self-Service Profile & Identity
- **Profile Updates:** Added `PATCH /api/users/me` allowing authenticated users to update their own `fullName` and `email`.
- **Avatar Support:** Implemented `POST /api/users/me/avatar` with `multer` integration. Supports multipart/form-data uploads and persists images as Data URIs in the database.

#### 3. Core Infrastructure & Security
- **Multipart CSRF Hardening:** Refactored the CSRF middleware to safely handle requests without pre-parsed bodies (required for file uploads).
- **Service Layer Maturity:** Added full Zod validation schemas for all user operations and standardized Prisma ESM import patterns for the custom generated client.
- **Client Discovery:** Verified `GET /api/clients` accessibility for internal roles to support project-client association.

### Testing Instructions (apps/backend)

**1. Update Dependencies:**
```powershell
npm install
```

**2. Run Automated Integration Tests:**
```powershell
# Verifies all 93 API endpoints including the 10 new user-admin tests
npm run test:api
```

**3. Target Specific Tests:**
```powershell
npx playwright test tests/api/users.spec.js
```

### Self Verification Status
All 93 backend API tests (Baseline + Feature) have run and **PASSED** on the local environment. Administrative safety guards and multipart upload logic have been fully validated.
