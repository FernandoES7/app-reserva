import pool from '../database/connection.js';

export const getAll = async () => {
  const [rows] = await pool.query(
    'SELECT * FROM tipo_habitaciones WHERE activo = TRUE ORDER BY precio_noche ASC'
  );
  return rows;
};

export const getDisponibles = async (checkin, checkout) => {
  const sql = `
    SELECT
      th.id,
      th.nombre,
      th.descripcion,
      th.capacidad,
      th.precio_noche,
      th.imagen_url,
      th.cantidad_total,
      (
        th.cantidad_total - COALESCE((
          SELECT COUNT(DISTINCT rh.habitacion_id)
          FROM reserva_habitaciones rh
          JOIN reservas r  ON r.id  = rh.reserva_id
          JOIN habitaciones h ON h.id = rh.habitacion_id
          WHERE h.tipo_id       = th.id
            AND r.estado       NOT IN ('cancelada')
            AND r.fecha_checkin  < ?
            AND r.fecha_checkout > ?
        ), 0)
      ) AS disponibles
    FROM tipo_habitaciones th
    WHERE th.activo = TRUE
    HAVING disponibles > 0
    ORDER BY th.precio_noche ASC
  `;
  const [rows] = await pool.query(sql, [checkout, checkin]);
  return rows;
};

export const getAllCatalog = async ({ soloActivos = true } = {}) => {
  const where = soloActivos ? 'WHERE activo = TRUE' : '';
  const [rows] = await pool.query(
    `SELECT * FROM tipo_habitaciones ${where} ORDER BY precio_noche ASC`
  );
  return rows;
};

export const getById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM tipo_habitaciones WHERE id = ?', [id]);
  return rows[0] || null;
};

export const crear = async ({ nombre, descripcion, capacidad, precio_noche, imagen_url, activo, cantidad_total }) => {
  const [result] = await pool.query(
    `INSERT INTO tipo_habitaciones
       (nombre, descripcion, capacidad, precio_noche, imagen_url, cantidad_total, activo)
     VALUES (?,?,?,?,?,?,?)`,
    [
      nombre,
      descripcion || null,
      capacidad ?? 1,
      precio_noche,
      imagen_url || null,
      cantidad_total ?? 1,
      activo !== false,
    ]
  );
  return getById(result.insertId);
};

export const actualizar = async (id, datos) => {
  const actual = await getById(id);
  if (!actual) return null;

  const [result] = await pool.query(
    `UPDATE tipo_habitaciones SET
       nombre = ?,
       descripcion = ?,
       capacidad = ?,
       precio_noche = ?,
       imagen_url = ?,
       activo = ?
     WHERE id = ?`,
    [
      datos.nombre ?? actual.nombre,
      datos.descripcion ?? actual.descripcion,
      datos.capacidad ?? actual.capacidad,
      datos.precio_noche ?? actual.precio_noche,
      datos.imagen_url ?? actual.imagen_url,
      datos.activo ?? actual.activo,
      id,
    ]
  );
  if (result.affectedRows === 0) return null;
  return getById(id);
};

export const eliminar = async (id) => {
  const [result] = await pool.query(
    'UPDATE tipo_habitaciones SET activo = FALSE WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};