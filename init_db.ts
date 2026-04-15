import pool from './db';

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
    );

    CREATE TABLE IF NOT EXISTS tyokohde (
      tyokohde_id SERIAL PRIMARY KEY,
      nimi TEXT NOT NULL,
      osoite TEXT NOT NULL,
      asiakas_id INTEGER REFERENCES asiakas(asiakas_id)
    );

    CREATE TABLE IF NOT EXISTS lasku (
      lasku_id SERIAL PRIMARY KEY,
      kokonaissumma NUMERIC,
      paivamaara DATE,
      erapaiva DATE,
      maksettu BOOLEAN DEFAULT false,
      tila TEXT CHECK (tila IN ('kesken', 'valmis')),
      edellinen_lasku INTEGER REFERENCES lasku(lasku_id),
      laskunro INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS tyosuorite (
      tyosuorite_id SERIAL PRIMARY KEY,
      asiakas_id INTEGER NOT NULL REFERENCES asiakas(asiakas_id),
      tyokohde_id INTEGER NOT NULL REFERENCES tyokohde(tyokohde_id),
      lasku_id INTEGER REFERENCES lasku(lasku_id),
      urakkasopimus_id INTEGER,
      tyyppi TEXT NOT NULL CHECK (tyyppi IN ('tunti', 'urakka'))
    );

  `);
  console.log('Tables created or already exist.');
  await pool.end();
}

initDb().catch(err => {
  console.error('Error initializing database:', err);
  process.exit(1);
});
