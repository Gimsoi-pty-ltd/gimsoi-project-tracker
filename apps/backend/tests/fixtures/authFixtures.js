import { test as base, request } from '@playwright/test';
import prisma from '../../lib/prisma.js';

const ROLE_MAP = {
    admin: 'ADMIN',
    pm: 'PM',
    client: 'CLIENT',
    intern: 'INTERN',
};

async function fetchCsrfToken(context) {
    const res = await context.get('/api/auth/csrf-token');
    const body = await res.json();
    return body.csrfToken;
}

async function createAuthenticatedApiContext(rolePrefix, emailSuffix, baseURL) {
    const targetRole = ROLE_MAP[rolePrefix] ?? 'INTERN';
    const context = await request.newContext({ baseURL });

    // 1. Signup (No CSRF needed)
    const email = `${rolePrefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}${emailSuffix}`;
    const password = 'Test123!@#';

    const signupRes = await context.post('/api/auth/signup', {
        data: { email, password, fullName: `Test ${rolePrefix.toUpperCase()}` }
    });
    
    if (signupRes.status() >= 400) {
        const body = await signupRes.text();
        throw new Error(`Signup failed (${signupRes.status()}): ${body}`);
    }

    let token = (await signupRes.json()).token;

    // 2. Verify user and promote + re-login if needed
    await prisma.user.update({
        where: { email },
        data: { isVerified: true }
    });

    if (targetRole !== 'INTERN') {
        await prisma.user.update({
            where: { email },
            data: { role: targetRole }
        });

        const loginRes = await context.post('/api/auth/login', {
            data: { email, password }
        });
        
        const loginData = await loginRes.json();
        token = loginData.token;
    }

    // 3. Extract storageState to retain session cookies
    const storageState = await context.storageState();

    // 4. Build final context with automatic CSRF injection
    const finalContext = await request.newContext({
        baseURL,
        storageState,
        extraHTTPHeaders: {
            'Authorization': `Bearer ${token}`
        }
    });

    // 5. Fetch clean CSRF token using the dedicated endpoint with the Authorization header
    const csrfToken = await fetchCsrfToken(finalContext);

    // Proxy to inject CSRF header into all mutating requests
    return new Proxy(finalContext, {
        get(target, prop) {
            const value = target[prop];
            if (typeof value === 'function' && ['post', 'patch', 'put', 'delete'].includes(prop)) {
                return async (url, options = {}) => {
                    const headers = { ...options.headers };
                    if (!headers['x-csrf-token'] && typeof csrfToken === 'string') {
                        headers['x-csrf-token'] = csrfToken;
                    }
                    
                    return value.call(target, url, {
                        ...options,
                        headers
                    });
                };
            }
            return value;
        }
    });
}

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
