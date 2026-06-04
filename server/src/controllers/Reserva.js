import * as ClienteModel  from '../models/Cliente.js';
import * as HabitacionModel from '../models/Habitacion.js';
import * as ReservaModel   from '../models/Reserva.js';

/*
  POST /api/reservas
  Body:
  {
    cliente: { nombre, apellido, email, telefono, dni },
    checkin: "YYYY-MM-DD",
    checkout: "YYYY-MM-DD",
    numHuespedes: 2,
    seleccion: [
      { tipoId: 1, cantidad: 1, precioNoche: 120 },
      { tipoId: 2, cantidad: 2, precioNoche: 180 }
    ]
  }
*/
export const crear = async (req, res) => {
  const { cliente: datosCliente, checkin, checkout, numHuespedes, seleccion } = req.body;

  if (!datosCliente?.email || !checkin || !checkout || !seleccion?.length) {
    return res.status(400).json({ ok: false, message: 'Datos incompletos' });
  }

  const dCheckin  = new Date(checkin);
  const dCheckout = new Date(checkout);
  if (dCheckout <= dCheckin) {
    return res.status(400).json({ ok: false, message: 'Fechas inválidas' });
  }

  const noches = Math.round((dCheckout - dCheckin) / (1000 * 60 * 60 * 24));

  try {
    const cliente = await ClienteModel.findOrCreate(datosCliente);

    const habitacionesAsignadas = [];
    let totalCalculado = 0;

    for (const { tipoId, cantidad, precioNoche } of seleccion) {
      const disponibles = await HabitacionModel.getDisponiblesPorTipo(
        tipoId, checkin, checkout, cantidad
      );

      if (disponibles.length < cantidad) {
        return res.status(409).json({
          ok: false,
          message: `No hay suficientes habitaciones disponibles del tipo ${tipoId}`
        });
      }

      for (const hab of disponibles.slice(0, cantidad)) {
        habitacionesAsignadas.push({ habitacion_id: hab.id, precio_noche: precioNoche });
        totalCalculado += precioNoche * noches;
      }
    }

    const reserva = await ReservaModel.crear({
      clienteId: cliente.id,
      checkin,
      checkout,
      numHuespedes,
      total: totalCalculado,
      habitacionesAsignadas
    });

    res.status(201).json({ ok: true, data: reserva });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al crear reserva', error: error.message });
  }
};

export const getByCodigo = async (req, res) => {
  try {
    const reserva = await ReservaModel.getByCodigo(req.params.codigo);
    if (!reserva) {
      return res.status(404).json({ ok: false, message: 'Reserva no encontrada' });
    }
    res.json({ ok: true, data: reserva });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al obtener reserva', error: error.message });
  }
};

const formatFecha = (fecha) => {
  if (!fecha) return null;
  if (typeof fecha === 'string') return fecha.slice(0, 10);
  return fecha.toISOString().slice(0, 10);
};

const formatReservaListado = (row) => ({
  id: row.id,
  codigo: row.codigo_reserva,
  nombre_cliente: `${row.cliente_nombre || ''} ${row.cliente_apellido || ''}`.trim(),
  email_cliente: row.cliente_email,
  habitacion_nombre: row.habitaciones || '—',
  check_in: formatFecha(row.fecha_checkin),
  check_out: formatFecha(row.fecha_checkout),
  huespedes: row.num_huespedes,
  total: Number(row.total),
  estado: row.estado,
});

export const listar = async (_req, res) => {
  try {
    const rows = await ReservaModel.getAll();
    res.json({ ok: true, reservations: rows.map(formatReservaListado) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al listar reservas', error: error.message });
  }
};

export const listarMias = async (req, res) => {
  try {
    const rows = await ReservaModel.getByClienteEmail(req.usuario.email);
    res.json({ ok: true, reservations: rows.map(formatReservaListado) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al obtener tus reservas', error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const reserva = await ReservaModel.getById(req.params.id);
    if (!reserva) {
      return res.status(404).json({ ok: false, message: 'Reserva no encontrada' });
    }
    res.json({ ok: true, data: reserva });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al obtener reserva', error: error.message });
  }
};

export const actualizarEstado = async (req, res) => {
  const { status } = req.body;
  const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];

  if (!status || !estadosValidos.includes(status)) {
    return res.status(400).json({ ok: false, message: 'Estado inválido' });
  }

  try {
    const reserva = await ReservaModel.updateEstado(req.params.id, status);
    if (!reserva) {
      return res.status(404).json({ ok: false, message: 'Reserva no encontrada' });
    }
    res.json({ ok: true, data: reserva });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al actualizar reserva', error: error.message });
  }
};

export const cancelar = async (req, res) => {
  try {
    const reserva = await ReservaModel.updateEstado(req.params.id, 'cancelada');
    if (!reserva) {
      return res.status(404).json({ ok: false, message: 'Reserva no encontrada' });
    }
    res.json({ ok: true, data: reserva });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al cancelar reserva', error: error.message });
  }
};