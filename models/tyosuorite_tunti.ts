import pool from '../db';

export interface TyosuoriteTunti {
  tunti_id?: number;
  tyosuorite_id: number;
  tyyppi: string;
  maara: number;
  alennus_prosentti: number;
}

export async function add(data: Omit<TyosuoriteTunti, 'tunti_id'>): Promise<TyosuoriteTunti> {
  const { tyosuorite_id, tyyppi, maara, alennus_prosentti } = data;
  const { rows } = await pool.query<TyosuoriteTunti>(
    'INSERT INTO tyosuorite_tunti (tyosuorite_id, tyyppi, maara, alennus_prosentti) VALUES (, , , ) RETURNING *',
    [tyosuorite_id, tyyppi, maara, alennus_prosentti || 0]
  );
  return rows[0] as TyosuoriteTunti;
}
