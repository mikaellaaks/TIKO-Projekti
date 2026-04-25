import pool from '../db';
import { XMLParser } from 'fast-xml-parser';

// Päivitä hinnasto XML tiedoston perusteella
export async function paivitaHinnasto(xmlData: string): Promise<string> {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix : "@_"
    });

    const parsed = parser.parse(xmlData);
    const toimittajaNimi = parsed.tarvikkeet.toimittaja.toim_nimi;
    
    // Yksittäinen tarvike ei välttämättä ole taulukko, joten pakotetaan se listaksi
    let tarvikkeet = parsed.tarvikkeet.tarvike;
    if (!Array.isArray(tarvikkeet)) {
        tarvikkeet = tarvikkeet ? [tarvikkeet] : [];
    }

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Etsi tai luo toimittaja
        let result = await client.query('SELECT toimittaja_id FROM toimittaja WHERE nimi = $1', [toimittajaNimi]);
        let toimittajaId = result.rows[0]?.toimittaja_id;

        if (!toimittajaId) {
            result = await client.query('INSERT INTO toimittaja (nimi) VALUES ($1) RETURNING toimittaja_id', [toimittajaNimi]);
            toimittajaId = result.rows[0].toimittaja_id;
        }

        // 2. Tallenna nykyiset (vanhat) tarvikkeet tämän toimittajan osalta taulukkoon
        const vanhatTarvikkeetRes = await client.query(
            'SELECT tarvike_id, nimi, merkki, yksikko, sisaanostohinta, myyntihinta, alv, toimittaja_id FROM tarvike WHERE toimittaja_id = $1', 
            [toimittajaId]
        );
        const vanhatTarvikkeet = vanhatTarvikkeetRes.rows;

        // Eristetään uuden XML:n tarvikkeiden (alkuperäiset) nimet listaksi
        const uudetNimet = tarvikkeet.map((t: any) => t.ttiedot.nimi);

        // 3. Siirretään HUKATUT tarvikkeet historiaan (Ne jotka ovat db:ssä, mutta puuttuvat XML:stä)
        for (const vanha of vanhatTarvikkeet) {
            if (!uudetNimet.includes(vanha.nimi)) {
                await client.query(
                    `INSERT INTO tarvike_historia (alkuperainen_tarvike_id, nimi, merkki, yksikko, sisaanostohinta, myyntihinta, alv, toimittaja_id) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [vanha.tarvike_id, vanha.nimi, vanha.merkki, vanha.yksikko, vanha.sisaanostohinta, vanha.myyntihinta, vanha.alv, vanha.toimittaja_id]
                );
                await client.query('DELETE FROM tarvike WHERE tarvike_id = $1', [vanha.tarvike_id]);
            }
        }

        // 4. Looppaa jokainen uusi tarvike (päivitä tai lisää)
        for (const t of tarvikkeet) {
            const { nimi, merkki, tyyppi, hinta, yksikko } = t.ttiedot;
            const alv = 24; 
            const myyntihinta = Number(hinta) * 1.25; // Esim. 25% kate

            // Onko jo olemassa?
            const onkoOlemassa = await client.query(
                'SELECT tarvike_id FROM tarvike WHERE nimi = $1 AND merkki = $2 AND toimittaja_id = $3',
                [nimi, merkki, toimittajaId]
            );

            if (onkoOlemassa.rows.length > 0) {
                // Päivitä hinta yms (saldo pysyy koskemattomana)
                await client.query(
                    'UPDATE tarvike SET yksikko = $1, sisaanostohinta = $2, myyntihinta = $3, alv = $4 WHERE tarvike_id = $5',
                    [yksikko, hinta, myyntihinta, alv, onkoOlemassa.rows[0].tarvike_id]
                );
            } else {
                // Lisää kokonaan uusi
                await client.query(
                    `INSERT INTO tarvike (nimi, merkki, yksikko, saldo, sisaanostohinta, myyntihinta, alv, toimittaja_id) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [nimi, merkki, yksikko, 0, hinta, myyntihinta, alv, toimittajaId]
                );
            }
        }

        await client.query('COMMIT');
        return "Hinnasto päivitetty onnistuneesti!";
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Virhe hinnaston päivityksessä:', error);
        throw error;
    } finally {
        client.release();
    }
}