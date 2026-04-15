import pool from '../db';

export interface Tyosuorite {
  tyosuorite_id?: number;
  asiakas_id: number;
  tyokohde_id: number;
  lasku_id?: number;
  urakkasopimus_id?: number;
  tyyppi: 'tunti' | 'urakka';
}

// Hae kaikki työsuoritteet
export async function getAll(): Promise<Tyosuorite[]> {
  const { rows } = await pool.query<Tyosuorite>('SELECT * FROM tyosuorite');
  return rows;
}

// Hae työsuorite ID:n perusteella
export async function getById(id: number): Promise<Tyosuorite | undefined> {
  const { rows } = await pool.query<Tyosuorite>(
    'SELECT * FROM tyosuorite WHERE tyosuorite_id = $1',
    [id]
  );
  return rows[0];
}

// Hae asiakkaan työsuoritteet
export async function getByAsiakas(asiakas_id: number): Promise<Tyosuorite[]> {
  const { rows } = await pool.query<Tyosuorite>(
    'SELECT * FROM tyosuorite WHERE asiakas_id = $1',
    [asiakas_id]
  );
  return rows;
}

// Lisää uusi työsuorite
export async function add(data: Omit<Tyosuorite, 'tyosuorite_id'>): Promise<Tyosuorite> {
  const { asiakas_id, tyokohde_id, lasku_id, urakkasopimus_id, tyyppi } = data;
  const { rows } = await pool.query<Tyosuorite>(
    `INSERT INTO tyosuorite (asiakas_id, tyokohde_id, lasku_id, urakkasopimus_id, tyyppi) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [asiakas_id, tyokohde_id, lasku_id, urakkasopimus_id, tyyppi]
  );
  return rows[0] as Tyosuorite;
}