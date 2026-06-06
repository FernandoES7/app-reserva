import pool from '../database/connection.js';

export const findById = async (id) => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM empleado
        WHERE id_empleado = ?
        `,
        [id]
    );

    return rows[0] || null;
};

export const findByEmail = async (email) => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM empleado
        WHERE email = ?
        AND estado = 'activo'
        `,
        [email]
    );

    return rows[0] || null;
};

export const findByEmailAny = async (email) => {
    const [rows] = await pool.query(
        `
        SELECT *
        FROM empleado
        WHERE email = ?
        `,
        [email]
    );

    return rows[0] || null;
};

export const getAll = async () => {

    const [rows] = await pool.query(
        `
        SELECT
            id_empleado,
            nombre,
            email,
            telefono,
            rol,
            estado,
            created_at
        FROM empleado
        ORDER BY created_at DESC
        `
    );

    return rows;
};

export const crear = async ({
    nombre,
    email,
    password_hash,
    telefono,
    rol,
    id_hotel
}) => {

    const [result] = await pool.query(
        `
        INSERT INTO empleado
        (
            id_hotel,
            nombre,
            email,
            password_hash,
            telefono,
            rol
        )
        VALUES
        (
            ?,?,?,?,?,?
        )
        `,
        [
            id_hotel,
            nombre,
            email,
            password_hash,
            telefono,
            rol
        ]
    );

    return findById(result.insertId);
};

export const actualizarRol = async (
    id,
    rol
) => {

    const [result] = await pool.query(
        `
        UPDATE empleado
        SET rol = ?
        WHERE id_empleado = ?
        `,
        [
            rol,
            id
        ]
    );

    return result.affectedRows > 0;
};

export const desactivar = async (id) => {

    const [result] = await pool.query(
        `
        UPDATE empleado
        SET estado='inactivo'
        WHERE id_empleado=?
        `,
        [id]
    );

    return result.affectedRows > 0;
};

export const actualizarEstado = async (id, estado) => {
    const [result] = await pool.query(
        `
        UPDATE empleado
        SET estado = ?
        WHERE id_empleado = ?
        `,
        [estado, id]
    );

    if (result.affectedRows === 0) return null;
    return findById(id);
};