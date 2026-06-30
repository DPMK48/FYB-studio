const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

function getClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

async function main() {
  console.log("Starting migration...");
  
  // Create public/uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory at: ${uploadsDir}`);
  }

  // Fetch only IDs and names first
  const initialClient = getClient();
  await initialClient.connect();
  const res = await initialClient.query('SELECT id, full_name FROM students ORDER BY id ASC');
  await initialClient.end();
  
  console.log(`Found ${res.rows.length} students to check.`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const student of res.rows) {
    const { id, full_name } = student;
    console.log(`Checking Student ID ${id} (${full_name})...`);

    // Open connection for this student
    const client = getClient();
    try {
      await client.connect();

      // Fetch the photo_url for this student specifically
      const photoRes = await client.query('SELECT photo_url FROM students WHERE id = $1', [id]);
      const photo_url = photoRes.rows[0]?.photo_url;

      if (!photo_url) {
        console.log(`-> No photo. Skipping.`);
        skippedCount++;
        continue;
      }

      // Check if it is a base64 data URL
      const match = photo_url.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      if (!match) {
        console.log(`-> Already a path or URL. Skipping.`);
        skippedCount++;
        continue;
      }

      const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Generate filename
      const filename = `photo_student_${id}_${Date.now()}.${ext}`;
      const filePath = path.join(uploadsDir, filename);

      // Save file
      fs.writeFileSync(filePath, buffer);
      console.log(`-> Saved file: ${filename} (${buffer.length} bytes)`);

      // Update database
      const dbPath = `/uploads/${filename}`;
      await client.query('UPDATE students SET photo_url = $1 WHERE id = $2', [dbPath, id]);
      console.log(`-> Updated DB path to: ${dbPath}`);
      
      migratedCount++;
    } catch (err) {
      console.error(`-> Error processing student ${id}:`, err);
    } finally {
      await client.end();
    }
  }

  console.log(`Migration completed. Migrated: ${migratedCount}, Skipped: ${skippedCount}.`);
}

main().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
