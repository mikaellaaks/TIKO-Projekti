import pool from '../db';

export interface TarvikeHistoria {
  historia_id?: number;
  alkuperainen_tarvike_id: number;
  nimi: string;
  merkki: string;
  yksikko: string;
  sisaanostohinta: number;
  myyntihinta: number;
  alv: number;
  toimittaja_id: number;
  poistettu_pvm?: Date;
}

// Hae kaikki tarvikkeet historiasta
export async function getAll(): Promise<TarvikeHistoria[]> {
  const { rows } = await pool.query<TarvikeHistoria>('SELECT * FROM tarvike_historia');
  return rows;
}

