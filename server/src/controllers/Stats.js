import * as StatsModel from '../models/Stats.js';

export const getDashboard = async (_req, res) => {
    try {
        const stats = await StatsModel.getDashboard();
        res.json({ ok: true, stats });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: 'Error al obtener estadísticas',
            error: error.message,
        });
    }
};
