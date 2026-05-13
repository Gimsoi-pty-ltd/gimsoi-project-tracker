import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/api',
    globalSetup: './tests/setup/globalSetup.js',
     fullyParallel: false,
    workers: 6,
    timeout: 60000,
    use: {
        baseURL: 'http://localhost:5001',
    },
    webServer: {
        command: 'npm run start',
        port: 5001,
        reuseExistingServer: true,
        timeout: 120000,
        env: {
            NODE_ENV: 'test'
        }
    },
});
