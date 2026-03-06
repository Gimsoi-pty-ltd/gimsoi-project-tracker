import { test as base, request } from '@playwright/test';

// Maps fixture prefix → DB role value (from constants/roles.js)
const ROLE_MAP = {
    admin: 'ADMIN',
    pm: 'PM',
    client: 'CLIENT',
    intern: 'INTERN',
};

/**
 * Creates a pre-authenticated API context for a given role.
 *
 * Flow (required because signup always assigns INTERN after security hardening Step 2):
 *   1. Signup → user created as INTERN
 *   2. POST /api/testing/promote-role → DB role updated
 *   3. Re-login → fresh JWT whose payload carries the new role
 *      (verifyToken.js reads role from decoded.role, not the DB — stale token = wrong RBAC)
 *   4. Return context with fresh token + CSRF cookie (cookie captured in storageState)
 *
 * NOTE: CSRF token is reused across all calls in this function because all three requests
 * (signup, promote, re-login) share the same browser context and the CSRF cookie persists.
 */
async function createAuthenticatedApiContext(rolePrefix, emailSuffix, baseURL) {
    const targetRole = ROLE_MAP[rolePrefix] ?? 'INTERN';
    const context = await request.newContext({ baseURL });

    // 1. Get CSRF Token
    const csrfRes = await context.get('/api/auth/csrf-token');
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;

    // 2. Generate unique email to prevent parallel worker collisions
    const cryptoHash = Math.floor(Math.random() * 1000000);
    const email = `${rolePrefix}-${Date.now()}-${cryptoHash}${emailSuffix}`;
    const password = 'Test123!@#';

    // 3. Signup — always produces INTERN (role field intentionally omitted per Step 2 hardening)
    const signupRes = await context.post('/api/auth/signup', {
        headers: { 'x-csrf-token': csrfToken },
        data: { email, password, fullName: `Test ${rolePrefix.toUpperCase()}` }
    });
    const signupData = await signupRes.json();
    if (!signupData.success) {
        throw new Error(`Signup failed for role '${rolePrefix}': ${signupData.message}`);
    }

    let token = signupData.token;

    // 4. Promote + re-login if we need a role above INTERN
    if (targetRole !== 'INTERN') {
        // 4a. Promote DB role
        const promoteRes = await context.post('/api/testing/promote-role', {
            headers: { 'x-csrf-token': csrfToken },
            data: { email, role: targetRole }
        });
        const promoteData = await promoteRes.json();
        if (!promoteData.success) {
            throw new Error(`Promote failed for ${email} → ${targetRole}: ${promoteData.message}`);
        }
        // Invariant: server must confirm the correct role before we proceed
        if (promoteData.data.role !== targetRole) {
            throw new Error(
                `Promotion invariant violated: server returned role '${promoteData.data.role}', expected '${targetRole}'`
            );
        }

        // 4b. Re-login — essential because the signup JWT still carries INTERN in its payload.
        //     verifyToken.js reads decoded.role, so using the old token would silently fail RBAC.
        const loginRes = await context.post('/api/auth/login', {
            headers: { 'x-csrf-token': csrfToken },
            data: { email, password }
        });
        const loginData = await loginRes.json();
        if (!loginData.success) {
            // DB role is correct but we have no valid JWT — test user is in a broken state.
            throw new Error(
                `Re-login failed for ${email} after promoting to ${targetRole}. ` +
                `DB role is correct but no valid JWT was returned: ${loginData.message}`
            );
        }
        // Invariant: fresh JWT must carry the promoted role
        if (loginData.user.role !== targetRole) {
            throw new Error(
                `Re-login JWT invariant violated: JWT carries role '${loginData.user.role}', expected '${targetRole}'`
            );
        }
        token = loginData.token;
    }

    // 5. Build final context — carry CSRF cookie from original context + fresh auth token
    const storageState = await context.storageState();
    const finalContext = await request.newContext({
        baseURL,
        storageState,
        extraHTTPHeaders: {
            'x-csrf-token': csrfToken,  // CSRF header: same token is valid for the session lifetime
            'Authorization': `Bearer ${token}`
        }
    });

    return finalContext;
}

// Extend base test by providing our custom fixtures
export const test = base.extend({
    // Defines a `pmApi` fixture which is an APIRequestContext pre-authenticated as a PROJECT_MANAGER
    pmApi: async ({ baseURL }, use) => {
        const pmContext = await createAuthenticatedApiContext('pm', '@gimsoi.test', baseURL);
        await use(pmContext);
        await pmContext.dispose();
    },

    // Defines an `adminApi` fixture which is an APIRequestContext pre-authenticated as an ADMIN
    adminApi: async ({ baseURL }, use) => {
        const adminContext = await createAuthenticatedApiContext('admin', '@gimsoi.test', baseURL);
        await use(adminContext);
        await adminContext.dispose();
    },

    // Defines a `clientApi` fixture which is an APIRequestContext pre-authenticated as a CLIENT
    clientApi: async ({ baseURL }, use) => {
        const clientContext = await createAuthenticatedApiContext('client', '@gimsoi.test', baseURL);
        await use(clientContext);
        await clientContext.dispose();
    },

    // Intern role placeholder
    internApi: async ({ baseURL }, use) => {
        const internContext = await createAuthenticatedApiContext('intern', '@gimsoi.test', baseURL);
        await use(internContext);
        await internContext.dispose();
    },

    // Entity Generators
    testClient: async ({ adminApi }, use) => {
        const res = await adminApi.post('/api/clients', {
            data: { name: `Test Client ${Date.now()}`, contactEmail: `client-${Date.now()}@test.com` }
        });
        const data = await res.json();
        const client = data.data;
        await use(client);
        // Note: globalSetup handles teardown, so we let the DB drop naturally at boot. 
        // Or we could explicitly delete it if we want strict intra-run isolation, but Playwright parallelization 
        // isolated by distinct IDs usually suffices.
    },

    testProject: async ({ pmApi, testClient }, use) => {
        const res = await pmApi.post('/api/projects', {
            data: { name: `Test Project ${Date.now()}`, clientId: testClient.id }
        });
        const data = await res.json();
        const project = data.data;
        await use(project);
    },

    testSprint: async ({ pmApi, testProject }, use) => {
        const res = await pmApi.post('/api/sprints', {
            data: { name: `Test Sprint ${Date.now()}`, projectId: testProject.id }
        });
        const data = await res.json();
        const sprint = data.data;
        await use(sprint);
    }
});

export { expect } from '@playwright/test';
