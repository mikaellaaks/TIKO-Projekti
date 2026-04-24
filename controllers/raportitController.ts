import pool from '../db';
import { type Request, type Response } from 'express';

export const getJunkCoRaportti = async (req: Request, res: Response) => {
    try {
        const sql = `
            SELECT 
                a.nimi AS asiakas,
                tk.nimi AS tyokohde,
                t.nimi AS tuote,
                st.maara
            FROM toimittaja tm
            JOIN tarvike t ON tm.toimittaja_id = t.toimittaja_id
            JOIN tyosuorite_tarvike st ON t.tarvike_id = st.tarvike_id
            JOIN tyosuorite s ON st.tyosuorite_id = s.tyosuorite_id
            JOIN tyokohde tk ON s.tyokohde_id = tk.tyokohde_id
            JOIN asiakas a ON tk.asiakas_id = a.asiakas_id
            WHERE tm.nimi = 'Junk Co'`;

        const { rows } = await pool.query(sql);
        res.render('raportit/junk_co_riski', { 
            title: 'Turvallisuusraportti: Junk Co', 
            tulokset: rows 
        });
    } catch (err) {
        console.error("Raporttivirhe:", err);
        res.status(500).send("Virhe haettaessa raporttia.");
    }
};