import pool from '../db';

export interface TyosuoriteTarvike {
  suorite_tarvike_id?: number;
  tyosuorite_id: number;
  tarvike_id: number;
  maara: number;
  alennus_prosentti: number;
}

export async function add(data: Omit<TyosuoriteTarvike, 'suorite_tarvike_id'>): Promise<TyosuoriteTarvike> {
  const { tyosuorite_id, tarvike_id, maara, alennus_prosentti } = data;
  const { rows } = await pool.query<TyosuoriteTarvike>(
    'INSERT INTO tyosuorite_tarvike (tyosuorite_id, tarvike_id, maara, alennus_prosentti) VALUES ($1, $2, $3, $4) RETURNING *',
    [tyosuorite_id, tarvike_id, maara, alennus_prosentti || 0]
  );
  return rows[0] as TyosuoriteTarvike;
}

export async function getByTyosuoriteId(tyosuorite_id: number): Promise<any[]> {
  const { rows } = await pool.query(
    `SELECT tt.*, t.nimi AS tarvike_nimi, t.yksikko
     FROM tyosuorite_tarvike tt
     JOIN tarvike t ON tt.tarvike_id = t.tarvike_id 
     WHERE tt.tyosuorite_id = $1 
     ORDER BY tt.suorite_tarvike_id ASC`,
    [tyosuorite_id]
  );
  return rows;
}
