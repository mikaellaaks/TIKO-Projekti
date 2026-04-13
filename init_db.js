const pool = require('./db');

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS toimittaja (
      toimittaja_id SERIAL PRIMARY KEY,
      nimi TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tarvike (
      tarvike_id SERIAL PRIMARY KEY,
      nimi TEXT NOT NULL,
      merkki TEXT,
      yksikko TEXT,
      saldo INTEGER,
      sisaanostohinta NUMERIC,
      myyntihinta NUMERIC,
      alv NUMERIC,
      toimittaja_id INTEGER REFERENCES toimittaja(toimittaja_id)
    );

    CREATE TABLE IF NOT EXISTS asiakas (
      asiakas_id SERIAL PRIMARY KEY,
      nimi TEXT NOT NULL,
      puhelinnro TEXT,
      sahkoposti TEXT,
      osoite TEXT NOT NULL
    )

  `);
  console.log('Tables created or already exist.');
  await pool.end();
}

initDb().catch(err => {
  console.error('Error initializing database:', err);
  process.exit(1);
});
