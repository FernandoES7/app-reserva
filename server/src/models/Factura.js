import pool from '../database/connection.js';

const generarNumeroFactura = () => {

    const fecha = new Date()
        .toISOString()
        .slice(0,10)
        .replace(/-/g,'');

    const random = Math.random()
        .toString(36)
        .substring(2,6)
        .toUpperCase();

    return `FAC-${fecha}-${random}`;
};

export const crear = async ({
    idReserva,
    subtotal,
    impuestos,
    total
}) => {

    const numeroFactura = generarNumeroFactura();

    const [result] = await pool.query(
        `
        INSERT INTO factura (
            id_reserva,
            numero_factura,
            subtotal,
            impuestos,
            total,
            estado
        )
        VALUES (?, ?, ?, ?, ?, 'emitida')
        `,
        [
            idReserva,
            numeroFactura,
            subtotal,
            impuestos,
            total
        ]
    );

    return getById(result.insertId);
};

export const getById = async (idFactura) => {

    const [[row]] = await pool.query(
        `
        SELECT
            f.*,
            r.codigo_reserva,
            c.nombre AS cliente
        FROM factura f
        INNER JOIN reserva r
            ON r.id_reserva = f.id_reserva
        INNER JOIN cliente c
            ON c.id_cliente = r.id_cliente
        WHERE f.id_factura = ?
        `,
        [idFactura]
    );

    return row || null;
};

export const getByNumero = async (numeroFactura) => {

    const [[row]] = await pool.query(
        `
        SELECT *
        FROM factura
        WHERE numero_factura = ?
        `,
        [numeroFactura]
    );

    return row || null;
};

export const listar = async () => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM factura
        ORDER BY created_at DESC
        `
    );

    return rows;
};

export const getByReserva = async (idReserva) => {

    const [[row]] = await pool.query(
        `
        SELECT *
        FROM factura
        WHERE id_reserva = ?
        `,
        [idReserva]
    );

    return row || null;
};