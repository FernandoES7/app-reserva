import pool from '../database/connection.js';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const getDashboard = async () => {
    const [[totales]] = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM reserva
        WHERE estado != 'cancelada'
        `
    );

    const [[habitaciones]] = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM habitacion
        WHERE estado = 'disponible'
        `
    );

    const [[mesActual]] = await pool.query(
        `
        SELECT
            COALESCE(SUM(num_huespedes), 0) AS huespedes,
            COALESCE(SUM(total), 0) AS ingresos
        FROM reserva
        WHERE estado IN ('confirmada', 'completada')
          AND MONTH(fecha_reserva) = MONTH(CURDATE())
          AND YEAR(fecha_reserva) = YEAR(CURDATE())
        `
    );

    const [filasMensual] = await pool.query(
        `
        SELECT
            MONTH(fecha_reserva) AS mes_num,
            COUNT(*) AS total
        FROM reserva
        WHERE fecha_reserva >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
          AND estado != 'cancelada'
        GROUP BY YEAR(fecha_reserva), MONTH(fecha_reserva)
        ORDER BY YEAR(fecha_reserva), MONTH(fecha_reserva)
        `
    );

    const maxMes = Math.max(...filasMensual.map((f) => f.total), 1);
    const mensual = filasMensual.map((f) => ({
        mes: MESES[f.mes_num - 1] || '',
        pct: Math.round((f.total / maxMes) * 100),
    }));

    return {
        totalReservas: Number(totales.total),
        habitacionesActivas: Number(habitaciones.total),
        huespedesMes: Number(mesActual.huespedes),
        ingresosMes: Number(mesActual.ingresos),
        mensual,
    };
};
