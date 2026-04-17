import { test as base, request } from '@playwright/test';
import prisma from '../../lib/prisma.js';

// Maps fixture prefix → DB role value (from constants/roles.js)
const ROLE_MAP = {
    admin: 'ADMIN',
    pm: 'PM',
    client: 'CLIENT',
    intern: 'INTERN',
};

/**
 * Helper to extract a cookie from a Playwright response object.
 * Robust against multiple set-cookie headers.
 */
function getCookie(res, name) {
    const setCookie = res.headers()['set-cookie'] || '';
    // Playwright joins multiple headers with \n or just returns the last one depending on env
    const cookieLines = setCookie.split('\n');
    for (const line of cookieLines) {
        if (line.trim().startsWith(`${name}=`)) {
            return line.split('=')[1].split(';')[0];
        }
    }
    return null;
}

/**
 * Creates a pre-authenticated API context for a given role.
 */
async function createAuthenticatedApiContext(rolePrefix, emailSuffix, baseURL) {
    const targetRole = ROLE_MAP[rolePrefix] ?? 'INTERN';
    const context = await request.newContext({ baseURL });

    // 1. Generate unique email
    const cryptoHash = Math.floor(Math.random() * 1000000);
    const email = `${rolePrefix}-${Date.now()}-${cryptoHash}${emailSuffix}`;
    const password = 'Test123!@#';

    // 2. Signup — Public route (no CSRF needed)
    const signupRes = await context.post('/api/auth/signup', {
        data: { email, password, fullName: `Test ${rolePrefix.toUpperCase()}` }
    });
    
    if (signupRes.status() >= 400) {
        const body = await signupRes.text();
        throw new Error(`Signup failed (${signupRes.status()}): ${body}`);
    }

    // Extract XSRF-TOKEN cookie
    let csrfToken = getCookie(signupRes, 'XSRF-TOKEN');
    let token = (await signupRes.json()).token;

    // 3. Promote + re-login if we need a role above INTERN
    if (targetRole !== 'INTERN') {
        // 3a. Promote DB role via Prisma directly
        await prisma.user.update({
            where: { email },
            data: { role: targetRole }
        });

        // 3b. Re-login — Public route (no CSRF needed)
        const loginRes = await context.post('/api/auth/login', {
            data: { email, password }
        });
        
        // Refresh token and CSRF secret
        const loginData = await loginRes.json();
        token = loginData.token;
        csrfToken = getCookie(loginRes, 'XSRF-TOKEN') || csrfToken;
    }

    // 4. Build final context
    const storageState = await context.storageState();
    const finalContext = await request.newContext({
        baseURL,
        storageState,
        extraHTTPHeaders: {
            'Authorization': `Bearer ${token}`
        }
    });

    // Proxy the context to automatically inject _csrf into mutating methods
    // We bind the target methods to ensure 'this' remains the APIRequestContext
    return new Proxy(finalContext, {
        get(target, prop) {
            const value = target[prop];
            if (typeof value === 'function' && ['post', 'patch', 'put', 'delete'].includes(prop)) {
                return async (url, options = {}) => {
                    const data = options.data || {};
                    // Inject _csrf into the body if it's not already there
                    const newData = { ...data };
                    if (!newData._csrf) newData._csrf = csrfToken;
                    
                    return value.call(target, url, {
                        ...options,
                        data: newData
                    });
                };
            }
            return value;
        }
    });
}

// Extend base test by providing our custom fixtures
export const test = base.extend({
    pmApi: async ({ baseURL }, use) => {
        const pmContext = await createAuthenticatedApiContext('pm', '@gimsoi.test', baseURL);
        await use(pmContext);
        await pmContext.dispose();
    },
    adminApi: async ({ baseURL }, use) => {
        const adminContext = await createAuthenticatedApiContext('admin', '@gimsoi.test', baseURL);
        await use(adminContext);
        await adminContext.dispose();
    },
    clientApi: async ({ baseURL }, use) => {
        const clientContext = await createAuthenticatedApiContext('client', '@gimsoi.test', baseURL);
        await use(clientContext);
        await clientContext.dispose();
    },
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
        if (!data.success) throw new Error(`testClient generator failed: ${data.message}`);
        await use(data.data);
    },
    testProject: async ({ pmApi, testClient }, use) => {
        const res = await pmApi.post('/api/projects', {
            data: { name: `Test Project ${Date.now()}`, clientId: testClient.id }
        });
        const data = await res.json();
        if (!data.success) throw new Error(`testProject generator failed: ${data.message}`);
        await use(data.data);
    },
    testSprint: async ({ pmApi, testProject }, use) => {
        const res = await pmApi.post('/api/sprints', {
            data: { name: `Test Sprint ${Date.now()}`, projectId: testProject.id }
        });
        const data = await res.json();
        if (!data.success) throw new Error(`testSprint generator failed: ${data.message}`);
        await use(data.data);
    }
});

export { expect } from '@playwright/test';
