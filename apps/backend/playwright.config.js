import { defineConfig } from '@playwright/test';

// ADDED (Task 8): safety guard. The tests wipe the database, so locally they must run
// against a dedicated test database from .env.test, never the dev database in .env.
// Stop the dev server before running the tests.
import dotenv from 'dotenv';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

if (process.env.CI !== 'true') {
    const testEnvPath = fileURLToPath(new URL('./.env.test', import.meta.url));
    const devEnvPath = fileURLToPath(new URL('./.env', import.meta.url));

    if (!fs.existsSync(testEnvPath)) {
        throw new Error('Missing .env.test. Create it with DATABASE_URL pointing at a dedicated TEST database (see tests/README.md).');
    }

    const testEnv = dotenv.parse(fs.readFileSync(testEnvPath));
    const devEnv = fs.existsSync(devEnvPath) ? dotenv.parse(fs.readFileSync(devEnvPath)) : {};

    if (!testEnv.DATABASE_URL) {
        throw new Error('.env.test has no DATABASE_URL.');
    }

    if (testEnv.DATABASE_URL === devEnv.DATABASE_URL) {
        throw new Error('REFUSING TO RUN: .env.test DATABASE_URL is the same as .env. The tests wipe the database, so they need their own.');
    }

    // override: true so the test database wins over anything already loaded
    dotenv.config({ path: testEnvPath, override: true, quiet: true });
}
// END ADDED

// Preserve the original port separation: local tests use 5002, CI uses 5001.
const PORT = process.env.CI === 'true' ? 5001 : 5002;

export default defineConfig({
    testDir: './tests/api',
    globalSetup: './tests/setup/globalSetup.js',
    fullyParallel: false,
    workers: 6,
    use: {
        baseURL: `http://localhost:${PORT}`,
    },
    webServer: {
        command: 'node server.js',
        port: PORT,
        reuseExistingServer: false,
        timeout: 120000,
        env: {
            NODE_ENV: 'test',
            CSRF_SECRET: 'mocked_test_secret',
            PORT: String(PORT),
        },
    },
});
