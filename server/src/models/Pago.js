import pool from '../database/connection.js';

export const crear = async ({
    idFactura,
    monto,
    referencia
}) => {

    const [result] = await pool.query(
        `
        INSERT INTO pago (
            id_factura,
            monto,
            referencia,
            estado
        )
        VALUES (?, ?, ?, 'completado')
        `,
        [
            idFactura,
            monto,
            referencia
        ]
    );

    return getById(result.insertId);
};

export const getById = async (idPago) => {

    const [[row]] = await pool.query(
        `
        SELECT *
        FROM pago
        WHERE id_pago = ?
        `,
        [idPago]
    );

    return row || null;
};

export const listar = async () => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM pago
        ORDER BY fecha DESC
        `
    );

    return rows;
};

export const getByFactura = async (idFactura) => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM pago
        WHERE id_factura = ?
        ORDER BY fecha DESC
        `,
        [idFactura]
    );

    return rows;
};

export const totalPagado = async (idFactura) => {

    const [[row]] = await pool.query(
        `
        SELECT
            COALESCE(SUM(monto),0) AS total
        FROM pago
        WHERE id_factura = ?
          AND estado = 'completado'
        `,
        [idFactura]
    );

    return Number(row.total);
};