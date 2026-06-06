import pool from '../database/connection.js';

export const getAll = async () => {
  const [rows] = await pool.query(
    'SELECT * FROM tipo_habitacion WHERE activo = TRUE ORDER BY precio_base ASC'
  );
  return rows;
};

export const getDisponibles = async (checkin, checkout) => {
  const sql = `
    SELECT
      th.id_tipo,
      th.nombre,
      th.descripcion,
      th.capacidad,
      th.precio_base,
      th.imagen_url,
      th.cantidad_total,
      (
        th.cantidad_total - COALESCE((
          SELECT COUNT(DISTINCT rh.id_habitacion)
          FROM reserva_habitacion rh
          JOIN reserva r  ON r.id_reserva  = rh.id_reserva
          JOIN habitacion h ON h.id_habitacion = rh.id_habitacion
          WHERE h.id_tipo       = th.id_tipo
            AND r.estado       NOT IN ('cancelada')
            AND r.fecha_checkin  < ?
            AND r.fecha_checkout > ?
        ), 0)
      ) AS disponibles
    FROM tipo_habitacion th
    WHERE th.activo = TRUE
    HAVING disponibles > 0
    ORDER BY th.precio_base ASC
  `;
  const [rows] = await pool.query(sql, [checkout, checkin]);
  console.log("He pasado por aca");
  return rows;
};

export const getAllAdmin = async () => {
  const [rows] = await pool.query(
    'SELECT * FROM tipo_habitacion ORDER BY precio_base ASC'
  );
  return rows;
};

export const getById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM tipo_habitacion WHERE id_tipo = ?',
    [id]
  );
  return rows[0] || null;
};

export const crear = async ({
  nombre,
  descripcion,
  capacidad,
  precio_base,
  imagen_url,
  activo,
  cantidad_total,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO tipo_habitacion
      (nombre, descripcion, capacidad, precio_base, imagen_url, cantidad_total, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      nombre,
      descripcion || null,
      capacidad ?? 1,
      precio_base,
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

  await pool.query(
    `
    UPDATE tipo_habitacion SET
      nombre = ?,
      descripcion = ?,
      capacidad = ?,
      precio_base = ?,
      imagen_url = ?,
      cantidad_total = ?,
      activo = ?
    WHERE id_tipo = ?
    `,
    [
      datos.nombre ?? actual.nombre,
      datos.descripcion ?? actual.descripcion,
      datos.capacidad ?? actual.capacidad,
      datos.precio_base ?? actual.precio_base,
      datos.imagen_url ?? actual.imagen_url,
      datos.cantidad_total ?? actual.cantidad_total,
      datos.activo ?? actual.activo,
      id,
    ]
  );
  return getById(id);
};

export const eliminar = async (id) => {
  const [result] = await pool.query(
    'UPDATE tipo_habitacion SET activo = FALSE WHERE id_tipo = ?',
    [id]
  );
  return result.affectedRows > 0;
};