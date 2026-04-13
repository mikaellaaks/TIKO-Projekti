const pool = require('../db');

// Hae kaikki asiakkaat
async function getAll() {
  const { rows } = await pool.query('SELECT * FROM asiakas');
  return rows;
}

// Lisää uusi asiakas
async function add(data) {
  // Accepts an object with keys: nimi, puhelinnro, sahkoposti, osoite
  const { nimi, puhelinnro, sahkoposti, osoite } = data;
  const { rows } = await pool.query(
    'INSERT INTO asiakas (nimi, puhelinnro, sahkoposti, osoite) VALUES ($1,$2,$3,$4) RETURNING *',
    [nimi, puhelinnro, sahkoposti, osoite]
  );
  return rows[0];
}

// Hae asiakas ID:n perusteella
async function getById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM asiakas WHERE asiakas_id = $1',
    [id]
  );
  return rows[0];
}

module.exports = { getAll, add, getById };