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

// Poista työkohde ID:n perusteella
export async function remove(id: number): Promise<void> {
    await pool.query('DELETE FROM tyokohde WHERE tyokohde_id = $1', [id]);
}

// Hae työkohteen tuntityöt
export async function getTuntityot(tyokohde_id: number) {
  const { rows } = await pool.query(
    `SELECT tt.* FROM tyosuorite_tunti tt
     JOIN tyosuorite ts ON tt.tyosuorite_id = ts.tyosuorite_id
     WHERE ts.tyokohde_id = $1`,
    [tyokohde_id]
  );
  return rows;
}

// Hae työkohteen tarvikkeet
export async function getTarvikkeet(tyokohde_id: number) {
  const { rows } = await pool.query(
    `SELECT t.nimi, t.myyntihinta, tt.maara FROM tyosuorite_tarvike tt
     JOIN tarvike t ON tt.tarvike_id = t.tarvike_id
     JOIN tyosuorite ts ON tt.tyosuorite_id = ts.tyosuorite_id
     WHERE ts.tyokohde_id = $1`,
    [tyokohde_id]
  );
  return rows;
}

