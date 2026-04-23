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
    'INSERT INTO tyosuorite_tarvike (tyosuorite_id, tarvike_id, maara, alennus_prosentti) VALUES (, , , ) RETURNING *',
    [tyosuorite_id, tarvike_id, maara, alennus_prosentti || 0]
  );
  return rows[0] as TyosuoriteTarvike;
}
