const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log("Connected.");
  const res = await client.query('SELECT photo_url FROM students WHERE id = 3');
  console.log("Fetched. Length:", res.rows[0]?.photo_url?.length);
  await client.end();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
