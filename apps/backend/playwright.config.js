import { defineConfig } from '@playwright/test';

export default defineConfig({
    workers: 1,
    use: {
        baseURL: 'http://localhost:5001',
    },
    webServer: {
        command: 'npm run start',
        port: 5001,
        reuseExistingServer: !process.env.CI,
    },
});
