import pool from '../database/connection.js';

export const getDisponiblesPorTipo = async (tipoId, checkin, checkout, cantidad) => {
  const sql = `
    SELECT
      h.id_habitacion AS id,
      h.numero,
      h.piso,
      h.id_tipo
    FROM habitacion h
    WHERE h.id_tipo = ?
      AND h.estado = 'disponible'
      AND h.id_habitacion NOT IN (
        SELECT rh.id_habitacion
        FROM reserva_habitacion rh
        INNER JOIN reserva r ON r.id_reserva = rh.id_reserva
        WHERE r.estado NOT IN ('cancelada')
          AND r.fecha_checkin  < ?
          AND r.fecha_checkout > ?
      )
    LIMIT ?
  `;
  const [rows] = await pool.query(sql, [tipoId, checkout, checkin, cantidad]);
  return rows;
};