import pool from '../db';

export interface Asiakas {
  asiakas_id?: number;
  nimi: string;
  puhelinnro: string;
  sahkoposti: string;
  osoite: string;
}

// Hae kaikki asiakkaat
export async function getAll(): Promise<Asiakas[]> {
  const { rows } = await pool.query<Asiakas>('SELECT * FROM asiakas');
  return rows;
}

// Lisää uusi asiakas
export async function add(data: Omit<Asiakas, 'asiakas_id'>): Promise<Asiakas> {
  const { nimi, puhelinnro, sahkoposti, osoite } = data;
  const { rows } = await pool.query<Asiakas>(
    'INSERT INTO asiakas (nimi, puhelinnro, sahkoposti, osoite) VALUES ($1, $2, $3, $4) RETURNING *',
    [nimi, puhelinnro, sahkoposti, osoite]
  );
  return rows[0] as Asiakas;
}

// Hae asiakas ID:n perusteella
export async function getById(id: number): Promise<Asiakas | undefined> {
  const { rows } = await pool.query<Asiakas>(
    'SELECT * FROM asiakas WHERE asiakas_id = $1',
    [id]
  );
  return rows[0];
}
