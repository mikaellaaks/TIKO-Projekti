import pool from '../db';

export interface Lasku {
  lasku_id?: number;
  kokonaissumma: number;
  paivamaara: Date;
  erapaiva: Date;
  maksettu: boolean;
  tila: 'kesken' | 'valmis';
  edellinen_lasku?: number;
  laskunro: number;
}

// Hae kaikki laskut
export async function getAll(): Promise<any[]> {
  const { rows } = await pool.query(`
    SELECT DISTINCT ON (lasku.lasku_id)
      lasku.*, 
      asiakas.nimi AS asiakas_nimi, 
      tyokohde.nimi AS tyokohde_nimi 
    FROM lasku
    LEFT JOIN tyosuorite ON lasku.lasku_id = tyosuorite.lasku_id
    LEFT JOIN asiakas ON tyosuorite.asiakas_id = asiakas.asiakas_id
    LEFT JOIN tyokohde ON tyosuorite.tyokohde_id = tyokohde.tyokohde_id
    ORDER BY lasku.lasku_id DESC
  `);
  return rows;
}

// Hae lasku ID:n perusteella
export async function getById(id: number): Promise<Lasku | undefined> {
  const { rows } = await pool.query<Lasku>(
    'SELECT * FROM lasku WHERE lasku_id = $1',
    [id]
  );
  return rows[0];
}

// Lisää uusi lasku
export async function add(data: Omit<Lasku, 'lasku_id'>, dbClient: any = pool): Promise<Lasku> {
  const { kokonaissumma, paivamaara, erapaiva, tila, laskunro, edellinen_lasku } = data;
  const { rows } = await dbClient.query(
    `INSERT INTO lasku (kokonaissumma, paivamaara, erapaiva, tila, laskunro, edellinen_lasku) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [kokonaissumma, paivamaara, erapaiva, tila, laskunro, edellinen_lasku || null]
  );
  return rows[0] as Lasku;
}

// Merkitse lasku maksetuksi
export async function updateMaksettu(id: number): Promise<Lasku | undefined> {
  const { rows } = await pool.query<Lasku>(
    'UPDATE lasku SET maksettu = true WHERE lasku_id = $1 RETURNING *',
    [id]
  );
  return rows[0];
}

// Lisää uusi muistutus/karhulasku
export async function addMuistutusLasku(): Promise<Lasku[]> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { rows } = await client.query<Lasku>(
      `SELECT * FROM lasku 
       WHERE maksettu = false 
       AND tila = 'valmis' 
       AND erapaiva < CURRENT_DATE
       AND lasku_id NOT IN (SELECT edellinen_lasku FROM lasku WHERE edellinen_lasku IS NOT NULL)`
    );

    const uudetLaskut: Lasku[] = [];

    for (const lasku of rows) {
      // 1. Laske viivästyneet päivät
      const nykyhetki = new Date();
      const erapaiva = new Date(lasku.erapaiva);
      const msPerDay = 1000 * 60 * 60 * 24;
      const viivastyneetPaivat = Math.floor((nykyhetki.getTime() - erapaiva.getTime()) / msPerDay);
      
      let uusiSumma = Number(lasku.kokonaissumma);

      // Lasku on muistutus
      if (lasku.laskunro === 1) {
        uusiSumma += 5;
      } else {
        // Karhulasku: edellinen summa + 5€ + viivästyskorko 16% (laskettu alkuperäisestä tai edellisestä)
        const korko = (viivastyneetPaivat / 365) * 0.16 * Number(lasku.kokonaissumma);
        uusiSumma = uusiSumma + 5 + korko;
      }

      const uusiErapaiva = new Date();
      uusiErapaiva.setDate(uusiErapaiva.getDate() + 14);

      // Kutsumme add-funktiota ja annamme transaction-clientin parametrinä
      const lisattyLasku = await add({
        kokonaissumma: uusiSumma,
        paivamaara: new Date(),
        erapaiva: uusiErapaiva,
        maksettu: false,
        tila: 'valmis',
        edellinen_lasku: lasku.lasku_id!,
        laskunro: lasku.laskunro + 1
      }, client);

      uudetLaskut.push(lisattyLasku);
    }
    
    await client.query('COMMIT');
    return uudetLaskut;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
export const getFullLaskuDetails = async (id: number) => {
  const query = `
    SELECT 
      l.*,
      a.nimi AS asiakas_nimi, a.osoite AS asiakas_osoite, a.sahkoposti,
      tk.nimi AS kohde_nimi, tk.osoite AS kohde_osoite,
      ts.tyosuorite_id, ts.tyyppi AS suorite_tyyppi
    FROM lasku l
    JOIN tyosuorite ts ON l.lasku_id = ts.lasku_id
    JOIN asiakas a ON ts.asiakas_id = a.asiakas_id
    JOIN tyokohde tk ON ts.tyokohde_id = tk.tyokohde_id
    WHERE l.lasku_id = $1;
  `;
  
  const res = await pool.query(query, [id]);
  const laskuBase = res.rows[0];

  if (!laskuBase) return null;

  // Haetaan erikseen tunnit
  const tunnitRes = await pool.query(
    'SELECT * FROM tyosuorite_tunti WHERE tyosuorite_id = $1', 
    [laskuBase.tyosuorite_id]
  );

  // Haetaan erikseen tarvikkeet
  const tarvikkeetRes = await pool.query(`
    SELECT tt.*, t.nimi, t.myyntihinta, t.alv 
    FROM tyosuorite_tarvike tt
    JOIN tarvike t ON tt.tarvike_id = t.tarvike_id
    WHERE tt.tyosuorite_id = $1`, 
    [laskuBase.tyosuorite_id]
  );

  return {
    ...laskuBase,
    tunnit: tunnitRes.rows,
    tarvikkeet: tarvikkeetRes.rows
  };
};