import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/api',
    globalSetup: './tests/setup/globalSetup.js',
    fullyParallel: true,
    workers: 1,
    use: {
        baseURL: 'http://localhost:5001',
    },
    webServer: {
        command: 'node server.js',
        port: 5001,
        reuseExistingServer: true,
        timeout: 120000,
        env: {
            NODE_ENV: 'test',
            CSRF_SECRET: 'mocked_test_secret'
        }
    },
});
