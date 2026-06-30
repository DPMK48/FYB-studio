const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT id, full_name, photo_url, payment_status FROM students ORDER BY id DESC LIMIT 5');
  console.log("Latest students:", res.rows);
  await client.end();
}

main().catch(console.error);
