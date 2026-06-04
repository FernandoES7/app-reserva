import * as TipoHabitacionModel from '../models/Tipohabitacion.js';

const TIPOS = ['simple', 'doble', 'triple', 'familiar', 'suite'];

export const deriveTipo = (nombre) => {
  const n = (nombre || '').toLowerCase();
  return TIPOS.find((t) => n.includes(t)) || 'simple';
};

export const formatRoom = (row) => ({
  id: row.id,
  nombre: row.nombre,
  tipo: deriveTipo(row.nombre),
  precio: Number(row.precio_noche),
  capacidad: row.capacidad,
  descripcion: row.descripcion || '',
  imagen: row.imagen_url || '',
  disponible: Boolean(row.activo),
});

const parseBody = (body) => ({
  nombre: body.nombre?.trim(),
  descripcion: body.descripcion ?? '',
  capacidad: Number(body.capacidad) || 1,
  precio_noche: Number(body.precio),
  imagen_url: body.imagen || null,
  activo: body.disponible !== false,
});

export const listar = async (_req, res) => {
  try {
    const rows = await TipoHabitacionModel.getAllCatalog({ soloActivos: true });
    res.json({ ok: true, rooms: rows.map(formatRoom) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al listar habitaciones', error: error.message });
  }
};

export const obtener = async (req, res) => {
  try {
    const row = await TipoHabitacionModel.getById(req.params.id);
    if (!row) {
      return res.status(404).json({ ok: false, message: 'Habitación no encontrada' });
    }
    res.json({ ok: true, room: formatRoom(row) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al obtener habitación', error: error.message });
  }
};

export const crear = async (req, res) => {
  const datos = parseBody(req.body);
  if (!datos.nombre || !datos.precio_noche) {
    return res.status(400).json({ ok: false, message: 'Nombre y precio son requeridos' });
  }

  try {
    const row = await TipoHabitacionModel.crear(datos);
    res.status(201).json({ ok: true, room: formatRoom(row) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al crear habitación', error: error.message });
  }
};

export const actualizar = async (req, res) => {
  const datos = parseBody(req.body);
  if (!datos.nombre || !datos.precio_noche) {
    return res.status(400).json({ ok: false, message: 'Nombre y precio son requeridos' });
  }

  try {
    const row = await TipoHabitacionModel.actualizar(req.params.id, datos);
    if (!row) {
      return res.status(404).json({ ok: false, message: 'Habitación no encontrada' });
    }
    res.json({ ok: true, room: formatRoom(row) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al actualizar habitación', error: error.message });
  }
};

export const eliminar = async (req, res) => {
  try {
    const ok = await TipoHabitacionModel.eliminar(req.params.id);
    if (!ok) {
      return res.status(404).json({ ok: false, message: 'Habitación no encontrada' });
    }
    res.json({ ok: true, message: 'Habitación eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al eliminar habitación', error: error.message });
  }
};
