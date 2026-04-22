/* Toimittaja */
CREATE TABLE IF NOT EXISTS toimittaja (
  toimittaja_id SERIAL PRIMARY KEY,
  nimi TEXT NOT NULL
);

/* Tarvike */
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

/* Asiakas */
CREATE TABLE IF NOT EXISTS asiakas (
  asiakas_id SERIAL PRIMARY KEY,
  nimi TEXT NOT NULL,
  puhelinnro TEXT,
  sahkoposti TEXT,
  osoite TEXT NOT NULL
);

/* Työkohde */
CREATE TABLE IF NOT EXISTS tyokohde (
  tyokohde_id SERIAL PRIMARY KEY,
  nimi TEXT NOT NULL,
  osoite TEXT NOT NULL,
  asiakas_id INTEGER REFERENCES asiakas(asiakas_id)
);

/* Lasku */
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

/* Urakkasopimus */
CREATE TABLE IF NOT EXISTS urakkasopimus (
  urakkasopimus_id SERIAL PRIMARY KEY,
  asiakas_id INTEGER NOT NULL REFERENCES asiakas(asiakas_id),
  tyokohde_id INTEGER NOT NULL REFERENCES tyokohde(tyokohde_id),
  suunnittelu_tunnit NUMERIC DEFAULT 0,
  tyo_tunnit NUMERIC DEFAULT 0,
  alennus_prosentti NUMERIC DEFAULT 0,
  hyvaksytty BOOLEAN DEFAULT false,
  luotu_pvm TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* Tarvikehistoria */
CREATE TABLE IF NOT EXISTS tarvike_historia (
  historia_id SERIAL PRIMARY KEY,
  alkuperainen_tarvike_id INTEGER,
  nimi TEXT NOT NULL,
  merkki TEXT,
  yksikko TEXT,
  sisaanostohinta NUMERIC,
  myyntihinta NUMERIC,
  alv NUMERIC,
  toimittaja_id INTEGER REFERENCES toimittaja(toimittaja_id),
  poistettu_pvm TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* Työsuorite */
CREATE TABLE IF NOT EXISTS tyosuorite (
  tyosuorite_id SERIAL PRIMARY KEY,
  asiakas_id INTEGER NOT NULL REFERENCES asiakas(asiakas_id),
  tyokohde_id INTEGER NOT NULL REFERENCES tyokohde(tyokohde_id),
  lasku_id INTEGER REFERENCES lasku(lasku_id),
  urakkasopimus_id INTEGER REFERENCES urakkasopimus(urakkasopimus_id),
  tyyppi TEXT NOT NULL CHECK (tyyppi IN ('tunti', 'urakka'))
);

CREATE TABLE IF NOT EXISTS tyosuorite_tunti (
  tunti_id SERIAL PRIMARY KEY,
  tyosuorite_id INTEGER NOT NULL REFERENCES tyosuorite(tyosuorite_id),
  tyyppi TEXT NOT NULL CHECK (tyyppi IN ('suunnittelu', 'työ', 'aputyö')),
  maara NUMERIC NOT NULL,
  alennus_prosentti NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tyotyyppi (
  tyotyyppi_id SERIAL PRIMARY KEY,
  nimi TEXT NOT NULL CHECK (nimi IN ('suunnittelu', 'työ', 'aputyö')),
  yksikkohinta NUMERIC NOT NULL
);
INSERT INTO tyotyyppi (nimi, yksikkohinta) VALUES 
  ('suunnittelu', 55),
  ('työ', 45),
  ('aputyö', 35)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS tyosuorite_tarvike (
  suorite_tarvike_id SERIAL PRIMARY KEY,
  tyosuorite_id INTEGER NOT NULL REFERENCES tyosuorite(tyosuorite_id),
  tarvike_id INTEGER NOT NULL REFERENCES tarvike(tarvike_id),
  maara INTEGER NOT NULL,
  alennus_prosentti NUMERIC DEFAULT 0
);