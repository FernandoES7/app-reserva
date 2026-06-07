import * as HotelModel from '../models/Hotel.js';

export const obtener = async (_req, res) => {
    try {
        const hotel = await HotelModel.getPrincipal();

        if (!hotel) {
            return res.status(404).json({ ok: false, message: 'No hay datos del hotel configurados' });
        }

        res.json({ ok: true, data: hotel });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Error al obtener configuración del hotel', error: error.message });
    }
};

export const actualizar = async (req, res) => {
    const { nombre, direccion, telefono, email, categoria, activo } = req.body;

    if (!nombre?.trim() || !direccion?.trim()) {
        return res.status(400).json({ ok: false, message: 'Nombre y dirección son requeridos' });
    }

    try {
        const actual = await HotelModel.getPrincipal();

        if (!actual) {
            return res.status(404).json({ ok: false, message: 'No hay datos del hotel configurados' });
        }

        const hotel = await HotelModel.actualizar(actual.id_hotel, {
            nombre: nombre.trim(),
            direccion: direccion.trim(),
            telefono: telefono?.trim() || null,
            email: email?.trim() || null,
            categoria: categoria?.trim() || null,
            activo: activo !== false && activo !== 0,
        });

        res.json({ ok: true, data: hotel, message: 'Configuración actualizada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Error al actualizar configuración', error: error.message });
    }
};
