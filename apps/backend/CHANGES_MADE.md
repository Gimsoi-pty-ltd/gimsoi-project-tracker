# Changes Made:
This update prepares the application for secure deployment on Zoho Catalyst by resolving critical cross-origin authentication bugs and pulling in essential UI and routing stability improvements.

## Features added

### Deployment Compatibility
- **Support for Catalyst Cookies:** Updated `jwt.utils.js` to strictly enforce `SameSite=None` and `secure=true`, allowing the session token to bypass browser blocks when Slate and AppSail communicate across domains.
- **Preflight & Caching Bypass:** Configured the frontend to dynamically inject `_csrf` tokens into payloads and implemented native form-encoding with Method-Override to successfully bypass strict Zoho Gateway Server `OPTIONS` interception.
- **Routing Stability:** Migrated the frontend to `HashRouter` with an embedded 404 fallback to prevent deep link crashes on Zoho Slate. enforced strict Linux case-sensitive import paths.

### UI / Frontend
- **Responsive Navigation:** Re-architected the `TopBar` to be fully responsive, introducing a robust "More" dropdown with click-outside closure for smaller screens. Removed dead code and optimized assets.

### Security
- **Stateless Architecture:** Replaced database-heavy CSRF session tokens with a resilient stateless HMAC-SHA256 cryptographic strategy.
- **DDoS Protection:** Enforced strict 100kb payload size limits in `server.js` to prevent memory exhaustion infrastructure attacks.
- **Secure Provisioning:** Ripped out testing backdoors from the server boot cycle. Demo accounts are now securely firewalled behind environment variables.
- **Input Validation:** Centralized `TaskPriority` validation into a shared utility to strictly reject invalid payloads before they hit the database.

## Testing (apps/backend)
- **Update Dependencies:** `npm install`
- **Update Database Schema:** `npm run db:setup`
- **Provision QA Accounts:** `$env:DEMO_PASSWORD="DemoPassword123!"; npm run db:seed`
  - *(Standard Roles: Admin, PM, Intern, Client use password: `Password123!`)*
- **Run Automated Tests:** `npm run test:api`

## View Backend deployment:
- https://project-tracker-api-10122923152.development.catalystappsail.com/api/health
- https://project-tracker-api-10122923152.development.catalystappsail.com/api/docs/

## Self Verification Status
All backend API tests have run and PASSED on the local environment.
