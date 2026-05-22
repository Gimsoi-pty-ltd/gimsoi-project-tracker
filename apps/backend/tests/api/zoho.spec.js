import { test, expect } from '@playwright/test';

test.describe('Zoho Auth API Tests', () => {

    test.describe('GET /api/zoho/login', () => {
        test('redirects to Zoho OAuth consent screen', async ({ request }) => {
            // Prevent playwright from automatically following the redirect
            const response = await request.get('/api/zoho/login', { maxRedirects: 0 });
            
            expect(response.status()).toBe(302);
            
            const location = response.headers()['location'];
            expect(location).toBeDefined();
            expect(location).toContain('https://accounts.zoho.com/oauth/v2/auth');
            expect(location).toContain('scope=ZohoProjects.projects.READ');
            expect(location).toContain('response_type=code');
        });
    });

    test.describe('GET /api/zoho/callback', () => {
        test('returns 400 when authorization code is missing', async ({ request }) => {
            const response = await request.get('/api/zoho/callback');
            expect(response.status()).toBe(400);
            
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.message).toBe('Missing authorization code');
        });

        test('returns error when authorization code is invalid', async ({ request }) => {
            // Sending an invalid code to actual Zoho API should result in an error from Zoho
            // Our logic checks !response.ok and forwards the error status
            const response = await request.get('/api/zoho/callback?code=invalid_mock_code');
            
            expect(response.status()).toBeGreaterThanOrEqual(400);
            expect(response.status()).toBeLessThan(600);
            
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.message).toBeDefined();
            expect(data.error).toBeDefined();
        });
    });
});
