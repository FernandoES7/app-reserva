import * as TipoHabitacionModel from '../models/Tipohabitacion.js';
import * as HabitacionModel from '../models/Habitacion.js';
import { HistorialError } from '../models/Habitacion.js';
import * as HotelModel from '../models/Hotel.js';

const esErrorHistorial = (error) =>
  error instanceof HistorialError || error.code === 'HISTORIAL_RESERVA';

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
    if (esErrorHistorial(error)) {
      return res.status(409).json({ ok: false, message: error.message, code: 'HISTORIAL_RESERVA' });
    }
    res.status(500).json({ ok: false, message: 'Error al actualizar tipo de habitación', error: error.message });
  }
};

export const eliminarTipo = async (req, res) => {
  try {
    const resultado = await TipoHabitacionModel.eliminar(req.params.id);
    if (resultado.notFound) {
      return res.status(404).json({ ok: false, message: 'Tipo de habitación no encontrado' });
    }
    res.json({
      ok: true,
      accion: resultado.accion,
      message: resultado.message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al eliminar tipo de habitación', error: error.message });
  }
};

export const getUnidadesPorTipo = async (req, res) => {
  try {
    const unidades = await TipoHabitacionModel.ensureUnidades(req.params.id);
    if (!unidades) {
      return res.status(404).json({ ok: false, message: 'Tipo de habitación no encontrado' });
    }
    res.json({ ok: true, data: unidades });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al obtener unidades', error: error.message });
  }
};

export const crearUnidad = async (req, res) => {
  const { numero, piso, estado } = req.body;

  if (!numero?.trim()) {
    return res.status(400).json({ ok: false, message: 'El número de habitación es requerido' });
  }

  try {
    const tipo = await TipoHabitacionModel.getById(req.params.id);
    if (!tipo) {
      return res.status(404).json({ ok: false, message: 'Tipo de habitación no encontrado' });
    }

    const hotel = await HotelModel.getPrincipal();
    if (!hotel) {
      return res.status(400).json({ ok: false, message: 'No hay un hotel configurado' });
    }

    const unidad = await HabitacionModel.crear({
      id_tipo: Number(req.params.id),
      id_hotel: hotel.id_hotel,
      numero: numero.trim(),
      piso: piso ?? 1,
      estado: estado || 'disponible',
    });

    await TipoHabitacionModel.syncCantidadTotal(req.params.id);

    res.status(201).json({ ok: true, data: unidad });
  } catch (error) {
    console.error(error);
    const status = error.code === 'ER_DUP_ENTRY' ? 409 : 500;
    res.status(status).json({
      ok: false,
      message: error.code === 'ER_DUP_ENTRY'
        ? 'Ya existe una habitación con ese número en el hotel'
        : 'Error al crear unidad',
      error: error.message,
    });
  }
};

export const actualizarUnidad = async (req, res) => {
  try {
    const unidad = await HabitacionModel.actualizar(req.params.id, req.body);
    if (!unidad) {
      return res.status(404).json({ ok: false, message: 'Habitación no encontrada' });
    }
    res.json({ ok: true, data: unidad });
  } catch (error) {
    console.error(error);
    const status = error.code === 'ER_DUP_ENTRY' ? 409 : 500;
    res.status(status).json({
      ok: false,
      message: error.code === 'ER_DUP_ENTRY'
        ? 'Ya existe una habitación con ese número en el hotel'
        : 'Error al actualizar habitación',
      error: error.message,
    });
  }
};

export const eliminarUnidad = async (req, res) => {
  try {
    const unidad = await HabitacionModel.getById(req.params.id);
    if (!unidad) {
      return res.status(404).json({ ok: false, message: 'Habitación no encontrada' });
    }

    await HabitacionModel.eliminar(req.params.id);
    await TipoHabitacionModel.syncCantidadTotal(unidad.id_tipo);

    res.json({ ok: true, message: 'Habitación eliminada' });
  } catch (error) {
    console.error(error);
    if (esErrorHistorial(error)) {
      return res.status(409).json({ ok: false, message: error.message, code: 'HISTORIAL_RESERVA' });
    }
    res.status(400).json({ ok: false, message: error.message || 'Error al eliminar habitación' });
  }
};