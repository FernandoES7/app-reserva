import * as TipoHabitacionModel from '../models/Tipohabitacion.js';

export const getDisponibles = async (req, res) => {
  const { checkin, checkout } = req.query;

  if (!checkin || !checkout) {
    return res.status(400).json({ ok: false, message: 'checkin y checkout son requeridos' });
  }

  const dCheckin  = new Date(checkin);
  const dCheckout = new Date(checkout);

  if (isNaN(dCheckin) || isNaN(dCheckout)) {
    return res.status(400).json({ ok: false, message: 'Fechas inválidas' });
  }
  if (dCheckout <= dCheckin) {
    return res.status(400).json({ ok: false, message: 'checkout debe ser posterior a checkin' });
  }

  try {
    const tipos = await TipoHabitacionModel.getDisponibles(checkin, checkout);
    res.json({ ok: true, data: tipos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al obtener habitaciones', error: error.message });
  }
};

export const getTodos = async (req, res) => {
  try {
    const tipos = await TipoHabitacionModel.getAll();
    res.json({ ok: true, data: tipos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al obtener tipos', error: error.message });
  }
};