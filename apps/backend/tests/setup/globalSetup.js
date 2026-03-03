import prisma from '../../lib/prisma.js';

export default async function globalSetup() {
    console.log('--- Playwright Global Setup: Wiping Database ---');
    try {
        // Delete all records in the correct dependency order
        // Projects -> Sprints -> Tasks structure.
        // Actually since we use PostgreSQL, we can TRUNCATE or just delete from bottom up.
        await prisma.task.deleteMany();
        await prisma.sprint.deleteMany();
        await prisma.project.deleteMany();
        await prisma.client.deleteMany();
        await prisma.user.deleteMany();
        console.log('--- Database Wipe Complete ---');
    } catch (e) {
        console.error('Failed to wipe database in globalSetup:', e);
        throw e;
    } finally {
        await prisma.$disconnect();
    }
}
