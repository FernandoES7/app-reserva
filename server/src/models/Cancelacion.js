import pool from '../database/connection.js';

export const crear = async ({
    idReserva,
    motivo,
    idEmpleado = null
}) => {

    const conn = await pool.getConnection();

    try {

        await conn.beginTransaction();

        const [[reserva]] = await conn.query(
            `
            SELECT id_reserva, estado
            FROM reserva
            WHERE id_reserva = ?
            `,
            [idReserva]
        );

        if (!reserva) {
            throw new Error('Reserva no encontrada');
        }

        if (reserva.estado === 'cancelada') {
            throw new Error('La reserva ya está cancelada');
        }

        const [[cancelacionExistente]] = await conn.query(
            `
            SELECT id_cancelacion
            FROM cancelacion
            WHERE id_reserva = ?
            `,
            [idReserva]
        );

        if (cancelacionExistente) {
            throw new Error('La reserva ya tiene un registro de cancelación');
        }

        await conn.query(
            `
            INSERT INTO cancelacion (
                id_reserva,
                motivo,
                id_empleado
            )
            VALUES (?, ?, ?)
            `,
            [
                idReserva,
                motivo || null,
                idEmpleado
            ]
        );

        await conn.query(
            `
            UPDATE reserva
            SET estado = 'cancelada'
            WHERE id_reserva = ?
            `,
            [idReserva]
        );

        await conn.commit();

        return true;

    } catch (error) {

        await conn.rollback();
        throw error;

    } finally {

        conn.release();

    }
};