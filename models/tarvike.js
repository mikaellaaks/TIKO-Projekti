const pool = require('../db');

// Hae kaikki tarvikkeet
async function getAll() {
  const { rows } = await pool.query(`
    SELECT tarvike.*, toimittaja.nimi AS toimittaja_nimi
    FROM tarvike
    JOIN toimittaja ON tarvike.toimittaja_id = toimittaja.toimittaja_id
  `);
  return rows;
}

// Lisää uusi tarvike
async function add(data) {
  const { nimi, merkki, yksikko, saldo, sisaanostohinta, myyntihinta, alv, toimittaja_id } = data;
  const { rows } = await pool.query(
    `INSERT INTO tarvike 
     (nimi, merkki, yksikko, saldo, sisaanostohinta, myyntihinta, alv, toimittaja_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [nimi, merkki, yksikko, saldo, sisaanostohinta, myyntihinta, alv, toimittaja_id]
  );
  return rows[0];
}

// Hae tarvike ID:n perusteella
async function getById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM tarvike WHERE tarvike_id = $1',
    [id]
  );
  return rows[0];
}

module.exports = { getAll, add, getById };