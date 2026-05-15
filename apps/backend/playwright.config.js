import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/api',
    globalSetup: './tests/setup/globalSetup.js',
     fullyParallel: true,
    workers: 6,
    use: {
        baseURL: 'http://localhost:5001',
    },
    webServer: {
        command: 'npm run start',
        port: 5001,
        reuseExistingServer: false,
        env: {
            NODE_ENV: 'test'
        }
    },
});
