import pool from '../database/connection.js';

export class HistorialError extends Error {
  constructor(message = 'La habitación tiene historial de reservas') {
    super(message);
    this.name = 'HistorialError';
    this.code = 'HISTORIAL_RESERVA';
  }
}

export const tieneHistorial = async (idHabitacion, conn = pool) => {
  const [[row]] = await conn.query(
    'SELECT COUNT(*) AS total FROM reserva_habitacion WHERE id_habitacion = ?',
    [idHabitacion]
  );
  return Number(row.total) > 0;
};

export const tipoTieneHistorial = async (idTipo, conn = pool) => {
  const [[row]] = await conn.query(
    `
    SELECT COUNT(*) AS total
    FROM reserva_habitacion rh
    INNER JOIN habitacion h ON h.id_habitacion = rh.id_habitacion
    WHERE h.id_tipo = ?
    `,
    [idTipo]
  );
  return Number(row.total) > 0;
};

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

export const getByTipo = async (tipoId) => {
  const [rows] = await pool.query(
    `
    SELECT
      id_habitacion,
      id_tipo,
      id_hotel,
      numero,
      piso,
      estado,
      created_at,
      updated_at
    FROM habitacion
    WHERE id_tipo = ?
    ORDER BY piso ASC, numero ASC
    `,
    [tipoId]
  );
  return rows;
};

export const getById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM habitacion WHERE id_habitacion = ?',
    [id]
  );
  return rows[0] || null;
};

export const countByTipo = async (tipoId, conn = pool) => {
  const [rows] = await conn.query(
    'SELECT COUNT(*) AS total FROM habitacion WHERE id_tipo = ?',
    [tipoId]
  );
  return Number(rows[0].total);
};

const numerosOcupadosEnHotel = async (idHotel, conn = pool) => {
  const [rows] = await conn.query(
    'SELECT numero FROM habitacion WHERE id_hotel = ?',
    [idHotel]
  );
  return new Set(rows.map((r) => r.numero));
};

const generarNumeros = (idTipo, cantidad, ocupados) => {
  const numeros = [];
  let seq = 1;
  while (numeros.length < cantidad) {
    const candidato = `${idTipo}-${String(seq).padStart(2, '0')}`;
    if (!ocupados.has(candidato)) {
      numeros.push(candidato);
      ocupados.add(candidato);
    }
    seq += 1;
  }
  return numeros;
};

export const crearVarias = async (conn, { id_tipo, id_hotel, cantidad, piso = 1 }) => {
  if (cantidad <= 0) return [];

  const ocupados = await numerosOcupadosEnHotel(id_hotel, conn);
  const numeros = generarNumeros(id_tipo, cantidad, ocupados);
  const creadas = [];

  for (const numero of numeros) {
    const [result] = await conn.query(
      `
      INSERT INTO habitacion (id_tipo, id_hotel, numero, piso, estado)
      VALUES (?, ?, ?, ?, 'disponible')
      `,
      [id_tipo, id_hotel, numero, piso]
    );
    creadas.push(result.insertId);
  }

  return creadas;
};

export const syncCantidad = async (conn, { id_tipo, id_hotel, cantidadObjetivo, piso = 1 }) => {
  const actual = await countByTipo(id_tipo, conn);

  if (actual === cantidadObjetivo) return { agregadas: 0, eliminadas: 0 };

  if (actual < cantidadObjetivo) {
    const faltantes = cantidadObjetivo - actual;
    await crearVarias(conn, { id_tipo, id_hotel, cantidad: faltantes, piso });
    return { agregadas: faltantes, eliminadas: 0 };
  }

  const sobrantes = actual - cantidadObjetivo;
  const [candidatas] = await conn.query(
    `
    SELECT h.id_habitacion
    FROM habitacion h
    WHERE h.id_tipo = ?
      AND h.id_habitacion NOT IN (
        SELECT rh.id_habitacion FROM reserva_habitacion rh
      )
    ORDER BY h.id_habitacion DESC
    LIMIT ?
    `,
    [id_tipo, sobrantes]
  );

  if (candidatas.length < sobrantes) {
    throw new HistorialError(
      'No se puede reducir la cantidad: una o más habitaciones tienen historial de reservas'
    );
  }

  for (const { id_habitacion } of candidatas) {
    await conn.query('DELETE FROM habitacion WHERE id_habitacion = ?', [id_habitacion]);
  }

  return { agregadas: 0, eliminadas: candidatas.length };
};

export const crear = async ({ id_tipo, id_hotel, numero, piso, estado = 'disponible' }) => {
  const [result] = await pool.query(
    `
    INSERT INTO habitacion (id_tipo, id_hotel, numero, piso, estado)
    VALUES (?, ?, ?, ?, ?)
    `,
    [id_tipo, id_hotel, numero, piso, estado]
  );
  return getById(result.insertId);
};

export const actualizar = async (id, datos) => {
  const actual = await getById(id);
  if (!actual) return null;

  await pool.query(
    `
    UPDATE habitacion SET
      numero = ?,
      piso = ?,
      estado = ?
    WHERE id_habitacion = ?
    `,
    [
      datos.numero ?? actual.numero,
      datos.piso ?? actual.piso,
      datos.estado ?? actual.estado,
      id,
    ]
  );
  return getById(id);
};

export const eliminar = async (id, conn = pool) => {
  if (await tieneHistorial(id, conn)) {
    throw new HistorialError(
      'No se puede eliminar: la habitación tiene historial de reservas'
    );
  }

  const [result] = await conn.query(
    'DELETE FROM habitacion WHERE id_habitacion = ?',
    [id]
  );
  return result.affectedRows > 0;
};

export const eliminarPorTipo = async (idTipo, conn = pool) => {
  await conn.query('DELETE FROM habitacion WHERE id_tipo = ?', [idTipo]);
};
