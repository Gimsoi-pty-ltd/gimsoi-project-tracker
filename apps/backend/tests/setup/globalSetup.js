import prisma from '../../lib/prisma.js';

export default async function globalSetup() {
    // SAFETY GUARD: in CI environments, refuse to wipe any database that doesn't look like
    // a local test database. GitHub Actions sets CI=true automatically.
    // Not enforced locally because developers may use a remote Prisma-hosted test database.
    // To enforce locally: set STRICT_DB_GUARD=true in your environment.
    const shouldGuard = process.env.CI === 'true' || process.env.STRICT_DB_GUARD === 'true';
    if (shouldGuard) {
        const dbUrl = process.env.DATABASE_URL ?? '';
        const localPatterns = ['localhost', '127.0.0.1', process.env.TEST_DB_IDENTIFIER].filter(Boolean);
        const isSafeTarget = localPatterns.some((p) => dbUrl.includes(p));

        if (!isSafeTarget) {
            // Redact password from URL before logging to avoid leaking credentials
            const safeUrl = dbUrl.replace(/:([^:@]+)@/, ':***@');
            throw new Error(
                `REFUSING TO WIPE: DATABASE_URL does not look like a test database.\n` +
                `  DATABASE_URL = "${safeUrl}"\n` +
                `  Allowed patterns: ${localPatterns.join(', ')}\n` +
                `  Set TEST_DB_IDENTIFIER env var to allow a non-local test database.`
            );
        }
    }

    console.log('--- Playwright Global Setup: Initializing clean test environment ---');
    try {
        // Delete all records in the correct dependency order
        // Projects -> Sprints -> Tasks structure.
        // Actually since we use PostgreSQL, we can TRUNCATE or just delete from bottom up.
        await prisma.task.deleteMany();
        await prisma.sprint.deleteMany();
        await prisma.project.deleteMany();
        await prisma.client.deleteMany();
        await prisma.user.deleteMany();
        console.log('--- Test environment initialized ---');
    } catch (e) {
        console.error('Failed to wipe database in globalSetup:', e);
        throw e;
    } finally {
        await prisma.$disconnect();
    }
}
