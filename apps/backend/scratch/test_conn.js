import pg from 'pg';
import "dotenv/config";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

async function test() {
    try {
        console.log('Testing connection to:', process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@'));
        const client = await pool.connect();
        console.log('CONNECTED successfully!');
        const res = await client.query('SELECT NOW()');
        console.log('Result:', res.rows[0]);
        client.release();
    } catch (e) {
        console.error('CONNECTION FAILED:', e);
    } finally {
        await pool.end();
    }
}

test();
