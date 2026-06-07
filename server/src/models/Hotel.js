import pool from '../database/connection.js';

export const getPrincipal = async () => {
    const [rows] = await pool.query(
        `
        SELECT *
        FROM hotel
        ORDER BY id_hotel ASC
        LIMIT 1
        `
    );

    return rows[0] || null;
};

export const actualizar = async (idHotel, datos) => {
    const actual = await getPrincipal();
    if (!actual || actual.id_hotel !== Number(idHotel)) {
        return null;
    }

    await pool.query(
        `
        UPDATE hotel SET
            nombre = ?,
            direccion = ?,
            telefono = ?,
            email = ?,
            categoria = ?,
            activo = ?
        WHERE id_hotel = ?
        `,
        [
            datos.nombre ?? actual.nombre,
            datos.direccion ?? actual.direccion,
            datos.telefono ?? actual.telefono,
            datos.email ?? actual.email,
            datos.categoria ?? actual.categoria,
            datos.activo ?? actual.activo,
            idHotel,
        ]
    );

    return getPrincipal();
};
