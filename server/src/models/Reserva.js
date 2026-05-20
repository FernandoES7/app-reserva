import pool from '../database/connection.js';

const generarCodigo = () => {
  const fecha  = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HB-${fecha}-${random}`;
};

export const crear = async ({ clienteId, checkin, checkout, numHuespedes, total, habitacionesAsignadas }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const codigo = generarCodigo();

    const [resResult] = await conn.query(
      `INSERT INTO reservas
         (cliente_id, fecha_checkin, fecha_checkout, num_huespedes, total, estado, codigo_reserva)
       VALUES (?,?,?,?,?,'confirmada',?)`,
      [clienteId, checkin, checkout, numHuespedes, total, codigo]
    );
    const reservaId = resResult.insertId;

    for (const { habitacion_id, precio_noche } of habitacionesAsignadas) {
      await conn.query(
        'INSERT INTO reserva_habitaciones (reserva_id, habitacion_id, precio_noche) VALUES (?,?,?)',
        [reservaId, habitacion_id, precio_noche]
      );
    }

    await conn.commit();

    return getById(reservaId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getById = async (id) => {
  const [[reserva]] = await pool.query(
    `SELECT r.*, c.nombre, c.apellido, c.email, c.telefono, c.dni
     FROM reservas r
     JOIN clientes c ON c.id = r.cliente_id
     WHERE r.id = ?`,
    [id]
  );
  if (!reserva) return null;

  const [habitaciones] = await pool.query(
    `SELECT rh.*, h.numero, h.piso, th.nombre AS tipo_nombre
     FROM reserva_habitaciones rh
     JOIN habitaciones h  ON h.id  = rh.habitacion_id
     JOIN tipo_habitaciones th ON th.id = h.tipo_id
     WHERE rh.reserva_id = ?`,
    [id]
  );

  return { ...reserva, habitaciones };
};

export const getByCodigo = async (codigo) => {
  const [[reserva]] = await pool.query(
    `SELECT r.*, c.nombre, c.apellido, c.email, c.telefono, c.dni
     FROM reservas r
     JOIN clientes c ON c.id = r.cliente_id
     WHERE r.codigo_reserva = ?`,
    [codigo]
  );
  if (!reserva) return null;

  const [habitaciones] = await pool.query(
    `SELECT rh.*, h.numero, h.piso, th.nombre AS tipo_nombre
     FROM reserva_habitaciones rh
     JOIN habitaciones h  ON h.id  = rh.habitacion_id
     JOIN tipo_habitaciones th ON th.id = h.tipo_id
     WHERE rh.reserva_id = ?`,
    [reserva.id]
  );

  return { ...reserva, habitaciones };
};