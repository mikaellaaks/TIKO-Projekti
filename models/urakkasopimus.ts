import pool from '../db';

export interface Urakkasopimus {
  urakkasopimus_id?: number;
  asiakas_id: number;
  tyokohde_id: number;
  suunnittelu_tunnit: number;
  tyo_tunnit: number;
  alennus_prosentti?: number;
  hyvaksytty: boolean;
  luotu_pvm?: Date;
}

// Hae kaikki urakat
export async function getAll(): Promise<Urakkasopimus[]> {
  const { rows } = await pool.query<Urakkasopimus>('SELECT * FROM urakkasopimus');
  return rows;
}

// Lisää uusi urakka
export async function add(data: Omit<Urakkasopimus, 'urakkasopimus_id' | 'luotu_pvm'>): Promise<Urakkasopimus> {
  const { asiakas_id, tyokohde_id, suunnittelu_tunnit, tyo_tunnit, alennus_prosentti, hyvaksytty } = data;
  const { rows } = await pool.query<Urakkasopimus>(
    'INSERT INTO urakkasopimus (asiakas_id, tyokohde_id, suunnittelu_tunnit, tyo_tunnit, alennus_prosentti, hyvaksytty) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [asiakas_id, tyokohde_id, suunnittelu_tunnit, tyo_tunnit, alennus_prosentti || 0, hyvaksytty]
  );
  return rows[0] as Urakkasopimus;
}
