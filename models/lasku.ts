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
export async function add(data: Omit<Lasku, 'lasku_id'>): Promise<Lasku> {
  const { kokonaissumma, paivamaara, erapaiva, tila, laskunro } = data;
  const { rows } = await pool.query<Lasku>(
    `INSERT INTO lasku (kokonaissumma, paivamaara, erapaiva, tila, laskunro) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [kokonaissumma, paivamaara, erapaiva, tila, laskunro]
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