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