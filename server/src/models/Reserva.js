import pool from '../database/connection.js';

const generarCodigoReserva = () => {
    const fecha = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '');

    const random = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();

    return `RS-${fecha}-${random}`;
};

const generarNumeroFactura = () => {
    const fecha = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '');

    const random = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();

    return `FAC-${fecha}-${random}`;
};

export const crearReserva = async ({
    idCliente,
    idEmpleado = null,
    fechaCheckin,
    fechaCheckout,
    numHuespedes,
    total
}) => {

    const codigoReserva = generarCodigoReserva();

    const [result] = await pool.query(
        `
        INSERT INTO reserva (
            id_cliente,
            id_empleado,
            codigo_reserva,
            fecha_checkin,
            fecha_checkout,
            num_huespedes,
            total,
            estado
        )
        VALUES (
            ?, ?, ?, ?, ?, ?, ?, 'confirmada'
        )
        `,
        [
            idCliente,
            idEmpleado,
            codigoReserva,
            fechaCheckin,
            fechaCheckout,
            numHuespedes,
            total
        ]
    );

    return {
        id_reserva: result.insertId,
        codigo_reserva: codigoReserva
    };
};

export const agregarHabitacion = async (
    idReserva,
    idHabitacion,
    precioNoche
) => {

    await pool.query(
        `
        INSERT INTO reserva_habitacion (
            id_reserva,
            id_habitacion,
            precio_noche
        )
        VALUES (?, ?, ?)
        `,
        [
            idReserva,
            idHabitacion,
            precioNoche
        ]
    );
};

export const getById = async (idReserva) => {

    const [[reserva]] = await pool.query(
        `
        SELECT
            r.*,

            c.nombre AS cliente_nombre,
            c.email,
            c.telefono,
            c.documento

        FROM reserva r

        INNER JOIN cliente c
            ON c.id_cliente = r.id_cliente

        WHERE r.id_reserva = ?
        `,
        [idReserva]
    );

    if (!reserva) return null;

    const [habitaciones] = await pool.query(
        `
        SELECT
            rh.id_detalle,
            rh.precio_noche,

            h.id_habitacion,
            h.numero,
            h.piso,

            th.nombre AS tipo_habitacion

        FROM reserva_habitacion rh

        INNER JOIN habitacion h
            ON h.id_habitacion = rh.id_habitacion

        INNER JOIN tipo_habitacion th
            ON th.id_tipo = h.id_tipo

        WHERE rh.id_reserva = ?
        `,
        [idReserva]
    );

    reserva.habitaciones = habitaciones.map((h) => ({
        ...h,
        id: h.id_habitacion,
        tipo_nombre: h.tipo_habitacion,
    }));

    return reserva;
};

export const crear = async ({
    clienteId,
    checkin,
    checkout,
    numHuespedes,
    total,
    habitacionesAsignadas,
}) => {
    const conn = await pool.getConnection();
    const codigoReserva = generarCodigoReserva();
    const numeroFactura = generarNumeroFactura();
    const referenciaPago = `SIM-${codigoReserva}`;

    try {
        await conn.beginTransaction();

        const [resResult] = await conn.query(
            `
            INSERT INTO reserva (
                id_cliente,
                id_empleado,
                codigo_reserva,
                fecha_checkin,
                fecha_checkout,
                num_huespedes,
                total,
                estado
            )
            VALUES (?, NULL, ?, ?, ?, ?, ?, 'confirmada')
            `,
            [clienteId, codigoReserva, checkin, checkout, numHuespedes, total]
        );

        const idReserva = resResult.insertId;

        for (const hab of habitacionesAsignadas) {
            await conn.query(
                `
                INSERT INTO reserva_habitacion (id_reserva, id_habitacion, precio_noche)
                VALUES (?, ?, ?)
                `,
                [idReserva, hab.habitacion_id, hab.precio_noche]
            );
        }

        const [facResult] = await conn.query(
            `
            INSERT INTO factura (id_reserva, numero_factura, subtotal, impuestos, total, estado)
            VALUES (?, ?, ?, 0, ?, 'emitida')
            `,
            [idReserva, numeroFactura, total, total]
        );

        await conn.query(
            `
            INSERT INTO pago (id_factura, monto, referencia, estado)
            VALUES (?, ?, ?, 'completado')
            `,
            [facResult.insertId, total, referenciaPago]
        );

        await conn.commit();
        return getById(idReserva);
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export const getByCodigo = async (codigo) => {

    const [[row]] = await pool.query(
        `
        SELECT id_reserva
        FROM reserva
        WHERE codigo_reserva = ?
        `,
        [codigo]
    );

    if (!row) return null;

    return getById(row.id_reserva);
};

export const listar = async () => {

    const [rows] = await pool.query(
        `
        SELECT
            r.id_reserva,
            r.codigo_reserva,
            r.fecha_checkin,
            r.fecha_checkout,
            r.num_huespedes,
            r.estado,
            r.total,
            c.nombre AS cliente_nombre,
            c.email AS cliente_email,
            GROUP_CONCAT(DISTINCT th.nombre ORDER BY th.nombre SEPARATOR ', ') AS habitaciones
        FROM reserva r
        INNER JOIN cliente c ON c.id_cliente = r.id_cliente
        LEFT JOIN reserva_habitacion rh ON rh.id_reserva = r.id_reserva
        LEFT JOIN habitacion h ON h.id_habitacion = rh.id_habitacion
        LEFT JOIN tipo_habitacion th ON th.id_tipo = h.id_tipo
        GROUP BY r.id_reserva
        ORDER BY r.created_at DESC
        `
    );

    return rows;
};

export const actualizarEstado = async (
    idReserva,
    estado
) => {

    await pool.query(
        `
        UPDATE reserva
        SET estado = ?
        WHERE id_reserva = ?
        `,
        [
            estado,
            idReserva
        ]
    );

    return getById(idReserva);
};

export const registrarCheckin = async (
    idReserva,
    observacion
) => {

    await pool.query(
        `
        UPDATE reserva
        SET
            fecha_checkin_real = NOW(),
            observacion_checkin = ?
        WHERE id_reserva = ?
        `,
        [
            observacion,
            idReserva
        ]
    );

    return getById(idReserva);
};

export const registrarCheckout = async (
    idReserva,
    observacion
) => {

    await pool.query(
        `
        UPDATE reserva
        SET
            fecha_checkout_real = NOW(),
            observacion_checkout = ?,
            estado = 'completada'
        WHERE id_reserva = ?
        `,
        [
            observacion,
            idReserva
        ]
    );

    return getById(idReserva);
};

export const existeReserva = async (idReserva) => {

    const [[row]] = await pool.query(
        `
        SELECT id_reserva
        FROM reserva
        WHERE id_reserva = ?
        `,
        [idReserva]
    );

    return !!row;
};

export const getByClienteEmail = async (email) => {
    const [rows] = await pool.query(
        `
        SELECT
            r.id_reserva AS id,
            r.codigo_reserva,
            r.fecha_checkin,
            r.fecha_checkout,
            r.num_huespedes,
            r.total,
            r.estado,
            c.nombre AS cliente_nombre,
            c.email AS cliente_email,
            GROUP_CONCAT(DISTINCT th.nombre ORDER BY th.nombre SEPARATOR ', ') AS habitaciones
        FROM reserva r
        INNER JOIN cliente c ON c.id_cliente = r.id_cliente
        LEFT JOIN reserva_habitacion rh ON rh.id_reserva = r.id_reserva
        LEFT JOIN habitacion h ON h.id_habitacion = rh.id_habitacion
        LEFT JOIN tipo_habitacion th ON th.id_tipo = h.id_tipo
        WHERE c.email = ?
        GROUP BY r.id_reserva
        ORDER BY r.created_at DESC
        `,
        [email]
    );
    return rows;
};

export const getAll = listar;
export const updateEstado = actualizarEstado;