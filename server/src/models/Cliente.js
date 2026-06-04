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

const SELECT_CLIENTE = `
  SELECT
    c.*,
    COUNT(r.id) AS num_reservas,
    u.rol AS usuario_rol
  FROM clientes c
  LEFT JOIN reservas r ON r.cliente_id = c.id
  LEFT JOIN usuarios u ON u.email = c.email AND u.activo = TRUE
`;

export const getAll = async () => {
  const [rows] = await pool.query(
    `${SELECT_CLIENTE}
     GROUP BY c.id, u.rol
     ORDER BY c.created_at DESC`
  );
  return rows;
};

export const getById = async (id) => {
  const [[row]] = await pool.query(
    `${SELECT_CLIENTE}
     WHERE c.id = ?
     GROUP BY c.id, u.rol`,
    [id]
  );
  return row || null;
};

export const eliminar = async (id) => {
  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) AS total FROM reservas WHERE cliente_id = ?',
    [id]
  );
  if (total > 0) {
    const err = new Error('No se puede eliminar: el cliente tiene reservas asociadas');
    err.code = 'HAS_RESERVATIONS';
    throw err;
  }
  const [result] = await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
  if (result.affectedRows === 0) return null;
  return true;
};