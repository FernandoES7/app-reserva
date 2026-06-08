import pool from '../database/connection.js';
import * as HabitacionModel from './Habitacion.js';
import * as HotelModel from './Hotel.js';

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
  const hotel = await HotelModel.getPrincipal();
  if (!hotel) {
    throw new Error('No hay un hotel configurado en el sistema');
  }

  const cantidad = cantidad_total ?? 1;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
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
        cantidad,
        activo !== false,
      ]
    );

    const idTipo = result.insertId;

    await HabitacionModel.crearVarias(conn, {
      id_tipo: idTipo,
      id_hotel: hotel.id_hotel,
      cantidad,
    });

    await conn.commit();
    return getById(idTipo);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

export const actualizar = async (id, datos) => {
  const actual = await getById(id);
  if (!actual) return null;

  const nuevaCantidad = datos.cantidad_total ?? actual.cantidad_total;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query(
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
        nuevaCantidad,
        datos.activo ?? actual.activo,
        id,
      ]
    );

    const actualCount = await HabitacionModel.countByTipo(id, conn);
    if (actualCount !== nuevaCantidad) {
      const hotel = await HotelModel.getPrincipal();
      if (!hotel) {
        throw new Error('No hay un hotel configurado en el sistema');
      }

      await HabitacionModel.syncCantidad(conn, {
        id_tipo: Number(id),
        id_hotel: hotel.id_hotel,
        cantidadObjetivo: nuevaCantidad,
      });
    }

    await conn.commit();
    return getById(id);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

export const inactivar = async (id, conn = pool) => {
  const [result] = await conn.query(
    'UPDATE tipo_habitacion SET activo = FALSE WHERE id_tipo = ?',
    [id]
  );
  return result.affectedRows > 0;
};

export const eliminarDefinitivo = async (id, conn = pool) => {
  await HabitacionModel.eliminarPorTipo(id, conn);
  const [result] = await conn.query(
    'DELETE FROM tipo_habitacion WHERE id_tipo = ?',
    [id]
  );
  return result.affectedRows > 0;
};

export const eliminar = async (id) => {
  const tipo = await getById(id);
  if (!tipo) return { ok: false, notFound: true };

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const conHistorial = await HabitacionModel.tipoTieneHistorial(id, conn);

    if (conHistorial) {
      const inactivado = await inactivar(id, conn);
      await conn.commit();
      return {
        ok: inactivado,
        accion: 'inactivado',
        message:
          'Este tipo tiene historial de reservas. No se puede eliminar; se ha inactivado.',
      };
    }

    const eliminado = await eliminarDefinitivo(id, conn);
    await conn.commit();
    return {
      ok: eliminado,
      accion: 'eliminado',
      message: 'Tipo de habitación y sus unidades eliminados permanentemente.',
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

export const syncCantidadTotal = async (id) => {
  const count = await HabitacionModel.countByTipo(id);
  await pool.query(
    'UPDATE tipo_habitacion SET cantidad_total = ? WHERE id_tipo = ?',
    [count, id]
  );
  return count;
};

export const ensureUnidades = async (id) => {
  const tipo = await getById(id);
  if (!tipo) return null;

  const actualCount = await HabitacionModel.countByTipo(id);
  if (actualCount >= tipo.cantidad_total) {
    return HabitacionModel.getByTipo(id);
  }

  const hotel = await HotelModel.getPrincipal();
  if (!hotel) {
    throw new Error('No hay un hotel configurado en el sistema');
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await HabitacionModel.syncCantidad(conn, {
      id_tipo: Number(id),
      id_hotel: hotel.id_hotel,
      cantidadObjetivo: tipo.cantidad_total,
    });
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  return HabitacionModel.getByTipo(id);
};