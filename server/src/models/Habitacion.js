import pool from '../database/connection.js';

export const getDisponiblesPorTipo = async (tipoId, checkin, checkout, cantidad) => {
  const sql = `
    SELECT h.id, h.numero, h.piso, h.tipo_id
    FROM habitaciones h
    WHERE h.tipo_id = ?
      AND h.estado  = 'disponible'
      AND h.id NOT IN (
        SELECT rh.habitacion_id
        FROM reserva_habitaciones rh
        JOIN reservas r ON r.id = rh.reserva_id
        WHERE r.estado       NOT IN ('cancelada')
          AND r.fecha_checkin  < ?
          AND r.fecha_checkout > ?
      )
    LIMIT ?
  `;
  const [rows] = await pool.query(sql, [tipoId, checkout, checkin, cantidad]);
  return rows;
};