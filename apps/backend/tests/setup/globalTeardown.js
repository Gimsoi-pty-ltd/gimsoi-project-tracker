import { rawPrisma as prisma, databasePool } from '../../lib/prisma.js';

export default async function globalTeardown() {
    await prisma.$disconnect();
    await databasePool.end();
}
