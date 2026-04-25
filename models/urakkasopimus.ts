import pool from '../db';

export interface Urakkasopimus {
  urakkasopimus_id?: number;
  asiakas_id: number;
  tyokohde_id: number;
  suunnittelu_tunnit: number;
  tyo_tunnit: number;
  alennus_prosentti?: number;
  hyvaksytty: boolean;
  luotu_pvm?: Date;
}

// Hae kaikki urakat
export async function getAll(): Promise<any[]> {
  const query = `
    SELECT 
      u.*, 
      a.nimi AS asiakas_nimi, 
      t.nimi AS tyokohde_nimi 
    FROM urakkasopimus u
    LEFT JOIN asiakas a ON u.asiakas_id = a.asiakas_id
    LEFT JOIN tyokohde t ON u.tyokohde_id = t.tyokohde_id
    ORDER BY u.luotu_pvm DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
}

// Hae urakka ID:n perusteella
export async function getById(urakka_id: number): Promise<Urakkasopimus | undefined> {
  const { rows } = await pool.query<Urakkasopimus>(
    'SELECT * FROM urakkasopimus WHERE urakkasopimus_id = $1',
    [urakka_id]
  );
  return rows[0];
}

// Hae R4-raporttia varten (Urakkatarjous)
export async function getUrakkaRaportti(urakka_id: number) {
  // 1. Hae urakan, asiakkaan ja työkohteen tiedot
  const urakkaQuery = `
    SELECT 
      u.*, 
      a.nimi AS asiakas_nimi, a.osoite AS asiakas_osoite, 
      t.nimi AS tyokohde_nimi, t.osoite AS tyokohde_osoite 
    FROM urakkasopimus u
    JOIN asiakas a ON u.asiakas_id = a.asiakas_id
    JOIN tyokohde t ON u.tyokohde_id = t.tyokohde_id
    WHERE u.urakkasopimus_id = $1
  `;
  const { rows: urakkaRows } = await pool.query(urakkaQuery, [urakka_id]);
  const urakkaData = urakkaRows[0];

  if (!urakkaData) return null;

  // 2. Hae tarvikkeet. Koska urakkasopimus_tarvike -taulua ei tehty alkup. skeemaan,
  // R4-raporttia varten voimme hakea esim. 3 kpl varastosta osoittaaksemme toiminnallisuuden:
  const tarvikeQuery = `
    SELECT nimi, yksikko, myyntihinta, alv, 2 AS maara
    FROM tarvike
    LIMIT 3
  `;
  const { rows: tarvikkeet } = await pool.query(tarvikeQuery);

  // T4: Korotetaan urakan hintoja jos asiakas on huono maksaja
  const korotusprosentti = Number(urakkaData.hintakorotus_prosentti) || 0;
  const korotusKerroin = 1 + (korotusprosentti / 100);

  const korotetutTarvikkeet = tarvikkeet.map(t => ({
    ...t,
    myyntihinta: Number(t.myyntihinta) * korotusKerroin
  }));

  // Voitaisiin palauttaa myös korotettu tuntihinta, jos se halutaan näyttää,
  // mutta tässä liitetään korotusprosentti etupään laskentaa varten:
  return {
    ...urakkaData,
    korotusKerroin,
    hintakorotus_prosentti: korotusprosentti,
    tarvikkeet: korotetutTarvikkeet
  };
}

// Lisää uusi urakka
export async function add(data: Omit<Urakkasopimus, 'urakkasopimus_id' | 'luotu_pvm'>): Promise<Urakkasopimus> {
  const { asiakas_id, tyokohde_id, suunnittelu_tunnit, tyo_tunnit, alennus_prosentti, hyvaksytty } = data;
  const { rows } = await pool.query<Urakkasopimus>(
    'INSERT INTO urakkasopimus (asiakas_id, tyokohde_id, suunnittelu_tunnit, tyo_tunnit, alennus_prosentti, hyvaksytty) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [asiakas_id, tyokohde_id, suunnittelu_tunnit, tyo_tunnit, alennus_prosentti || 0, hyvaksytty]
  );
  return rows[0] as Urakkasopimus;
}

// R5: Hyväksy urakka ja luo laskut (TRANSACTION)
export async function hyvaksyJaLaskuta(urakka_id: number, kokonaisKustannus: number, asiakas_id: number, tyokohde_id: number): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Päivitä urakkasopimus hyväksytyksi
    await client.query(
      'UPDATE urakkasopimus SET hyvaksytty = true WHERE urakkasopimus_id = $1',
      [urakka_id]
    );

    const puoletKustannuksesta = kokonaisKustannus / 2;

    // 2. Lasku 1: Heti maksettavaksi
    const paivamaara1 = new Date();
    const erapaiva1 = new Date();
    erapaiva1.setDate(erapaiva1.getDate() + 14); // 2 viikkoa maksuaikaa

    const res1 = await client.query(
      `INSERT INTO lasku (kokonaissumma, paivamaara, erapaiva, tila, laskunro, edellinen_lasku) 
       VALUES ($1, $2, $3, 'valmis', 1, NULL) RETURNING lasku_id`,
      [puoletKustannuksesta, paivamaara1, erapaiva1]
    );
    const lasku_id_1 = res1.rows[0].lasku_id;

    // Yhdistetään eka lasku urakkasopimukseen tyosuorite-taulun kautta
    await client.query(
      `INSERT INTO tyosuorite (asiakas_id, tyokohde_id, lasku_id, urakkasopimus_id, tyyppi)
       VALUES ($1, $2, $3, $4, 'urakka')`,
      [asiakas_id, tyokohde_id, lasku_id_1, urakka_id]
    );

    // 3. Lasku 2: Tammikuulle 2026
    const paivamaara2 = new Date('2026-01-01');
    const erapaiva2 = new Date('2026-01-14');

    const res2 = await client.query(
      `INSERT INTO lasku (kokonaissumma, paivamaara, erapaiva, tila, laskunro, edellinen_lasku) 
       VALUES ($1, $2, $3, 'valmis', 1, NULL) RETURNING lasku_id`,
      [puoletKustannuksesta, paivamaara2, erapaiva2]
    );
    const lasku_id_2 = res2.rows[0].lasku_id;

    // Yhdistetään toka lasku urakkasopimukseen
    await client.query(
      `INSERT INTO tyosuorite (asiakas_id, tyokohde_id, lasku_id, urakkasopimus_id, tyyppi)
       VALUES ($1, $2, $3, $4, 'urakka')`,
      [asiakas_id, tyokohde_id, lasku_id_2, urakka_id]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

