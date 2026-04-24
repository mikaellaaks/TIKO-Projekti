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
  hintakorotus_prosentti NUMERIC DEFAULT 0,
  hyvaksytty BOOLEAN DEFAULT false,
  luotu_pvm TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE urakkasopimus ADD COLUMN IF NOT EXISTS hintakorotus_prosentti NUMERIC DEFAULT 0;

/* T4: Luotettavuustriggeri (Asiakkaan hintakorotus hämärätaustan mukaan) */
CREATE OR REPLACE FUNCTION t4_tarkista_asiakas_luotettavuus()
RETURNS TRIGGER AS $$
DECLARE
  maksamattomat_laskut INT;
  karhutut_laskut INT;
BEGIN
  -- Tarkistetaan erääntyneet, maksamattomat laskut asiakkaalta
  SELECT COUNT(*) INTO maksamattomat_laskut
  FROM lasku l
  JOIN tyosuorite ts ON ts.lasku_id = l.lasku_id
  WHERE ts.asiakas_id = NEW.asiakas_id
    AND l.maksettu = false
    AND l.tila = 'valmis'
    AND l.erapaiva < CURRENT_DATE;

  IF maksamattomat_laskut > 0 THEN
    NEW.hintakorotus_prosentti = 30;
  ELSE
    -- Tarkistetaan 2 vuoden takaa olevat karhulaskut (laskunro >= 3)
    SELECT COUNT(*) INTO karhutut_laskut
    FROM lasku l
    JOIN tyosuorite ts ON ts.lasku_id = l.lasku_id
    WHERE ts.asiakas_id = NEW.asiakas_id
      AND l.laskunro >= 3
      AND l.paivamaara >= CURRENT_DATE - INTERVAL '2 years';
      
    IF karhutut_laskut > 0 THEN
      NEW.hintakorotus_prosentti = 10;
    ELSE
      NEW.hintakorotus_prosentti = 0;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS t4_urakkatarjous_trigger ON urakkasopimus;
CREATE TRIGGER t4_urakkatarjous_trigger
BEFORE INSERT ON urakkasopimus
FOR EACH ROW
EXECUTE FUNCTION t4_tarkista_asiakas_luotettavuus();

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

CREATE TABLE IF NOT EXISTS tyosuorite_tarvike (
  suorite_tarvike_id SERIAL PRIMARY KEY,
  tyosuorite_id INTEGER NOT NULL REFERENCES tyosuorite(tyosuorite_id),
  tarvike_id INTEGER NOT NULL REFERENCES tarvike(tarvike_id),
  maara INTEGER NOT NULL,
  alennus_prosentti NUMERIC DEFAULT 0
);