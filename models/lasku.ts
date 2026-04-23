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
export async function getAll(): Promise<Lasku[]> {
  const { rows } = await pool.query<Lasku>('SELECT * FROM lasku');
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