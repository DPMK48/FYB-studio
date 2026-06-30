const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log("Connecting...");
  await client.connect();
  console.log("Connected.");
  
  console.log("Querying students...");
  const sRes = await client.query('SELECT count(*) FROM students');
  console.log("Students count:", sRes.rows[0]);
  
  console.log("Querying activities...");
  const aRes = await client.query('SELECT count(*) FROM activities');
  console.log("Activities count:", aRes.rows[0]);

  console.log("Querying material_orders...");
  const mRes = await client.query('SELECT count(*) FROM material_orders');
  console.log("Material orders count:", mRes.rows[0]);

  await client.end();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
