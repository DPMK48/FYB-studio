const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log("Connected.");
  
  const res = await client.query('SELECT id, full_name, OCTET_LENGTH(photo_url) as photo_size FROM students');
  for (const row of res.rows) {
    console.log(`Student ID: ${row.id}, Name: ${row.full_name}, Photo Size: ${row.photo_size} bytes`);
  }
  
  const totalSize = res.rows.reduce((sum, r) => sum + (Number(r.photo_size) || 0), 0);
  console.log("Total photo size in database:", totalSize, "bytes (", (totalSize / (1024 * 1024)).toFixed(2), "MB )");

  await client.end();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
