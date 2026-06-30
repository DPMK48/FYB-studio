const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log("Connected to database.");

  // Find all students with .svg+xml in their photo_url
  const res = await client.query("SELECT id, full_name, photo_url FROM students WHERE photo_url LIKE '%.svg+xml'");
  console.log(`Found ${res.rows.length} records to repair.`);

  for (const row of res.rows) {
    const { id, full_name, photo_url } = row;
    const oldPath = photo_url;
    const newPath = oldPath.replace('.svg+xml', '.svg');

    const oldDiskPath = path.join(process.cwd(), 'public', oldPath);
    const newDiskPath = path.join(process.cwd(), 'public', newPath);

    if (fs.existsSync(oldDiskPath)) {
      fs.renameSync(oldDiskPath, newDiskPath);
      console.log(`Renamed file: ${oldDiskPath} -> ${newDiskPath}`);
    } else {
      console.log(`File not found on disk: ${oldDiskPath}`);
    }

    await client.query('UPDATE students SET photo_url = $1 WHERE id = $2', [newPath, id]);
    console.log(`Updated database path for ID ${id} (${full_name}): ${oldPath} -> ${newPath}`);
  }

  await client.end();
}

main().catch(console.error);
