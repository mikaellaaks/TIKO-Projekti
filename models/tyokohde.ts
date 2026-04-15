import pool from '../db';

export interface Tyokohde {
  tyokohde_id?: number;
  nimi: string;
  osoite: string;
  asiakas_id: number;
}

// Hae kaikki työkohteet
export async function getAll(): Promise<Tyokohde[]> {
  const { rows } = await pool.query<Tyokohde>('SELECT * FROM tyokohde');
  return rows;
}

// Hae työkohde ID:n perusteella
export async function getById(id: number): Promise<Tyokohde | undefined> {
  const { rows } = await pool.query<Tyokohde>(
    'SELECT * FROM tyokohde WHERE tyokohde_id = $1',
    [id]
  );
  return rows[0];
}

// Hae asiakkaan työkohteet
export async function getByAsiakas(asiakas_id: number): Promise<Tyokohde[]> {
  const { rows } = await pool.query<Tyokohde>(
    'SELECT * FROM tyokohde WHERE asiakas_id = $1',
    [asiakas_id]
  );
  return rows;
}

// Lisää uusi työkohde
export async function add(data: Omit<Tyokohde, 'tyokohde_id'>): Promise<Tyokohde> {
  const { nimi, osoite, asiakas_id } = data;
  const { rows } = await pool.query<Tyokohde>(
    'INSERT INTO tyokohde (nimi, osoite, asiakas_id) VALUES ($1, $2, $3) RETURNING *',
    [nimi, osoite, asiakas_id]
  );
  return rows[0] as Tyokohde;
}