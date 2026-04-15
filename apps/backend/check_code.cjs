const { Client } = require('pg');
const client = new Client({
    connectionString: 'postgres://368a40cdaa517989af086b7be5f1f69ef9e3980a254ceb2c5009ca979ecf8c8a:sk__w1bcARFadoJPlcmfz2J4@db.prisma.io:5432/postgres?sslmode=verify-full'
});
async function run() {
    await client.connect();
    // Extend by 24 hours
    const res = await client.query('UPDATE "User" SET "verificationTokenExpiresAt" = NOW() + INTERVAL \'24 hours\' WHERE email=$1 RETURNING "verificationToken"', ['demo.account@gimsoi.com']);
    console.log('\n================================');
    console.log('Fixed! Expiration extended by 24h.');
    console.log('Code to use:', res.rows[0]?.verificationToken);
    console.log('================================\n');
    await client.end();
}
run().catch(console.error);
