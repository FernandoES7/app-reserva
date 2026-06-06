import * as TipoHabitacionModel from '../models/Tipohabitacion.js';

export const getTodos = async (req, res) => {
  try {
    const tipos = await TipoHabitacionModel.getAll();
    res.json({ ok: true, data: tipos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al obtener tipos', error: error.message });
  }
};

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

export const getTodosAdmin = async (_req, res) => {
  try {
    const tipos = await TipoHabitacionModel.getAllAdmin();
    res.json({ ok: true, data: tipos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al obtener tipos', error: error.message });
  }
};

export const crearTipo = async (req, res) => {
  const { nombre, precio_base, capacidad } = req.body;

  if (!nombre?.trim() || precio_base == null || precio_base === '') {
    return res.status(400).json({ ok: false, message: 'Nombre y precio son requeridos' });
  }

  try {
    const tipo = await TipoHabitacionModel.crear(req.body);
    res.status(201).json({ ok: true, data: tipo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al crear tipo de habitación', error: error.message });
  }
};

export const actualizarTipo = async (req, res) => {
  try {
    const tipo = await TipoHabitacionModel.actualizar(req.params.id, req.body);
    if (!tipo) {
      return res.status(404).json({ ok: false, message: 'Tipo de habitación no encontrado' });
    }
    res.json({ ok: true, data: tipo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al actualizar tipo de habitación', error: error.message });
  }
};

export const eliminarTipo = async (req, res) => {
  try {
    const eliminado = await TipoHabitacionModel.eliminar(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ ok: false, message: 'Tipo de habitación no encontrado' });
    }
    res.json({ ok: true, message: 'Tipo de habitación desactivado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al eliminar tipo de habitación', error: error.message });
  }
};