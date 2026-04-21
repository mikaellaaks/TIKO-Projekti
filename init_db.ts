import pool from './db';
import fs from 'fs';
import path from 'path';

async function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  await pool.query(schemaSql);
  console.log('Tables created or already exist.');
  await pool.end();
}

initDb().catch(err => {
  console.error('Error initializing database:', err);
  process.exit(1);
});
