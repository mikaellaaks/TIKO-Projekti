import pool from '../db';

export interface Toimittaja {
  toimittaja_id?: number;
  nimi: string;
}

// Hae kaikki toimittajat
export async function getAll(): Promise<Toimittaja[]> {
  const { rows } = await pool.query<Toimittaja>('SELECT * FROM toimittaja');
  return rows;
}

// Lisää uusi toimittaja
export async function add(data: Omit<Toimittaja, 'toimittaja_id'>): Promise<Toimittaja> {
  const { nimi } = data;
  const { rows } = await pool.query<Toimittaja>(
    'INSERT INTO toimittaja (nimi) VALUES ($1) RETURNING *',
    [nimi]
  );
  return rows[0] as Toimittaja;
}

// Hae toimittaja ID:n perusteella
export async function getById(id: number): Promise<Toimittaja | undefined> {
  const { rows } = await pool.query<Toimittaja>(
    'SELECT * FROM toimittaja WHERE toimittaja_id = $1',
    [id]
  );
  return rows[0];
}

// Poista toimittaja ID:n perusteella
export async function remove(id: number): Promise<void> {
    await pool.query('DELETE FROM toimittaja WHERE toimittaja_id = $1', [id]);
}
