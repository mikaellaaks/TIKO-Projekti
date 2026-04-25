import pool from '../db';

export interface Tarvike {
  tarvike_id?: number;
  nimi: string;
  merkki: string;
  yksikko: string;
  saldo: number;
  sisaanostohinta: number;
  myyntihinta: number;
  alv: number;
  toimittaja_id: number;
  toimittaja_nimi?: string;
}

// Hae kaikki tarvikkeet
export async function getAll(): Promise<Tarvike[]> {
  const { rows } = await pool.query<Tarvike>(`
    SELECT tarvike.*, toimittaja.nimi AS toimittaja_nimi
    FROM tarvike
    LEFT JOIN toimittaja ON tarvike.toimittaja_id = toimittaja.toimittaja_id
  `);
  return rows;
}

// Lisää uusi tarvike
export async function add(data: Omit<Tarvike, 'tarvike_id' | 'toimittaja_nimi'>): Promise<Tarvike> {
  const { nimi, merkki, yksikko, saldo, sisaanostohinta, myyntihinta, alv, toimittaja_id } = data;
  const { rows } = await pool.query<Tarvike>(
    `INSERT INTO tarvike
     (nimi, merkki, yksikko, saldo, sisaanostohinta, myyntihinta, alv, toimittaja_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [nimi, merkki, yksikko, saldo, sisaanostohinta, myyntihinta, alv, toimittaja_id]
  );
  return rows[0] as Tarvike;
}

// Hae tarvike ID:n perusteella
export async function getById(id: number): Promise<Tarvike | undefined> {
  const { rows } = await pool.query<Tarvike>(
    'SELECT * FROM tarvike WHERE tarvike_id = $1',
    [id]
  );
  return rows[0];
}

// Vähennä tarvikkeen saldoa
export async function decreaseStock(id: number, amount: number) {
  const tarvike = await getById(id);
  if (tarvike) {
    await pool.query(
      `UPDATE tarvike SET saldo = saldo - $1 WHERE tarvike_id = $2`,
      [amount, id]
    );
  }
}

// models/tarvike.ts

export async function archive(id: number): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(`
            INSERT INTO tarvike_historia (...) 
            SELECT ... FROM tarvike WHERE tarvike_id = $1
        `, [id]);

        await client.query(`
            UPDATE tyosuorite_tarvike 
            SET tarvike_id = NULL 
            WHERE tarvike_id = $1
        `, [id]);

        await client.query('DELETE FROM tarvike WHERE tarvike_id = $1', [id]);

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
