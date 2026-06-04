import * as ClienteModel from '../models/Cliente.js';
import * as UsuarioModel from '../models/Usuario.js';

export const formatUser = (row) => ({
  id: row.id,
  name: `${row.nombre || ''} ${row.apellido || ''}`.trim(),
  email: row.email,
  role: row.usuario_rol === 'admin' ? 'admin' : 'customer',
  telefono: row.telefono || '',
  dni: row.dni || '',
  reservations: Number(row.num_reservas) || 0,
  createdAt: row.created_at,
});

export const listar = async (_req, res) => {
  try {
    const rows = await ClienteModel.getAll();
    res.json({ ok: true, users: rows.map(formatUser) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al listar usuarios', error: error.message });
  }
};

export const obtener = async (req, res) => {
  try {
    const row = await ClienteModel.getById(req.params.id);
    if (!row) {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    }
    res.json({ ok: true, user: formatUser(row) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al obtener usuario', error: error.message });
  }
};

export const actualizar = async (req, res) => {
  const { role } = req.body;

  if (role !== 'admin') {
    return res.status(400).json({ ok: false, message: 'Solo se permite promover a administrador' });
  }

  try {
    const cliente = await ClienteModel.getById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    }

    if (cliente.usuario_rol === 'admin') {
      return res.status(409).json({ ok: false, message: 'Este usuario ya es administrador' });
    }

    const nombre = `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim();
    await UsuarioModel.promoverAdmin({ nombre, email: cliente.email });

    const actualizado = await ClienteModel.getById(req.params.id);
    res.json({
      ok: true,
      user: formatUser(actualizado),
      message: 'Usuario promovido a administrador. Debe usar "Olvidé mi contraseña" si aún no tiene acceso.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al promover usuario', error: error.message });
  }
};

export const eliminar = async (req, res) => {
  try {
    const ok = await ClienteModel.eliminar(req.params.id);
    if (ok === null) {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    }
    res.json({ ok: true, message: 'Usuario eliminado' });
  } catch (error) {
    if (error.code === 'HAS_RESERVATIONS') {
      return res.status(409).json({ ok: false, message: error.message });
    }
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al eliminar usuario', error: error.message });
  }
};
