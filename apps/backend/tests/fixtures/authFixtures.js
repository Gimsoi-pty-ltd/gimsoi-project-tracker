import { test as base, request } from '@playwright/test';

// Helper function to create an authenticated API context for a specific role
async function createAuthenticatedApiContext(rolePrefix, emailSuffix, baseURL) {
    const context = await request.newContext({ baseURL });

    // 1. Get CSRF Token
    const csrfRes = await context.get('/api/auth/csrf-token');
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;

    // 2. Generate unique email to prevent parallel worker collisions
    const cryptoHash = Math.floor(Math.random() * 1000000);
    const email = `${rolePrefix}-${Date.now()}-${cryptoHash}${emailSuffix}`;
    const password = 'Test123!@#';

    // 3. Signup
    const signupRes = await context.post('/api/auth/signup', {
        headers: { 'x-csrf-token': csrfToken },
        data: {
            email,
            password,
            fullName: `Test ${rolePrefix.toUpperCase()}`,
            role: rolePrefix.toUpperCase()
        }
    });

    const signupData = await signupRes.json();
    if (!signupData.success) {
        throw new Error(`Failed to provision test user for role ${rolePrefix}: ${signupData.message}`);
    }

    // Assume login is not strictly needed since signup returns token, but doing it to ensure cookie state if needed
    // The context automatically persists cookies (like the csrf-token cookie).

    const token = signupData.token;

    // Create an intercepted context that automatically injects the auth headers for every request
    const authContext = await request.newContext({
        baseURL,
        extraHTTPHeaders: {
            'x-csrf-token': csrfToken,
            'Authorization': `Bearer ${token}`
        }
    });

    // We also need to copy over the cookies to the new context (specifically the csrf cookie)
    const storageState = await context.storageState();
    const finalContext = await request.newContext({
        baseURL,
        storageState,
        extraHTTPHeaders: {
            'x-csrf-token': csrfToken,
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
