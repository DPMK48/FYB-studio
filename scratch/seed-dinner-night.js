const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const res = await client.query(
    `UPDATE activities 
     SET image_url = '/images/dinner-night.jpg', 
         price = 8000 
     WHERE id = 1`
  );
  console.log("Updated activity:", res.rowCount);
  await client.end();
}

main().catch(console.error);
