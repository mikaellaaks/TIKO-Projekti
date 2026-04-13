const pool = require('../db');

// Hae kaikki toimittajat
async function getAll() {
  const { rows } = await pool.query('SELECT * FROM toimittaja');
  return rows;
}
// Lisää uusi toimittaja
async function add(data) {
  const { nimi } = data;
  const { rows } = await pool.query(
    'INSERT INTO toimittaja (nimi) VALUES ($1) RETURNING *',
    [nimi]
  );
  return rows[0];
}

// Hae toimittaja ID:n perusteella
async function getById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM toimittaja WHERE toimittaja_id = $1',
    [id]
  );
  return rows[0];
}

module.exports = { getAll, add, getById };