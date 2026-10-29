import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const isCI = process.env.CI === 'true';

// Locally, tests must use a dedicated test database from .env.test.
// In CI, the workflow provides DATABASE_URL itself.
if (!isCI) {
    const testEnvPath = path.join(here, '.env.test');
    const devEnvPath = path.join(here, '.env');

    if (!fs.existsSync(testEnvPath)) {
        throw new Error(
            'Missing .env.test. Create it with DATABASE_URL pointing at a dedicated TEST database.'
        );
    }

    const testEnv = dotenv.parse(fs.readFileSync(testEnvPath));
    const devEnv = fs.existsSync(devEnvPath)
        ? dotenv.parse(fs.readFileSync(devEnvPath))
        : {};

    if (!testEnv.DATABASE_URL) {
        throw new Error('.env.test has no DATABASE_URL.');
    }
    if (testEnv.DATABASE_URL === devEnv.DATABASE_URL) {
        throw new Error(
            'REFUSING TO RUN: .env.test DATABASE_URL is the same as .env. ' +
            'The tests wipe the database, so they need their own.'
        );
    }

    // override: true so the test DB wins over anything already loaded
    dotenv.config({ path: testEnvPath, override: true, quiet: true });
}

// Test server gets its own port locally so it never collides with `npm start` (5001).
const PORT = isCI ? 5001 : 5002;

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