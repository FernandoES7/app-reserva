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