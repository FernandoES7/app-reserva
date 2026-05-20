import pool from '../database/connection.js';

export const findOrCreate = async ({ nombre, apellido, email, telefono, dni }) => {
  const [existing] = await pool.query(
    'SELECT * FROM clientes WHERE email = ?',
    [email]
  );
  if (existing.length > 0) return existing[0];

  const [result] = await pool.query(
    'INSERT INTO clientes (nombre, apellido, email, telefono, dni) VALUES (?,?,?,?,?)',
    [nombre, apellido, email, telefono || null, dni || null]
  );
  const [rows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [result.insertId]);
  return rows[0];
};