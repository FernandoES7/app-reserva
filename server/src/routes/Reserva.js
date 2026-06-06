import { Router } from 'express';

import {
    crearReserva,
    listarReservas,
    obtenerMisReservas,
    obtenerReserva,
    cancelarReserva,
    actualizarEstado,
    registrarCheckin,
    registrarCheckout
} from '../controllers/Reserva.js';

import {
    verificarToken
} from '../middlewares/Auth.js';

const router = Router();

router.post('/', crearReserva);

router.get('/', verificarToken, listarReservas);

router.get('/mis', verificarToken, obtenerMisReservas);

router.get('/:id', verificarToken, obtenerReserva);

router.put('/:id/cancelar', verificarToken, cancelarReserva);

router.put('/:id/estado', verificarToken, actualizarEstado);

router.put('/:id/checkin', verificarToken, registrarCheckin);

router.put('/:id/checkout', verificarToken, registrarCheckout);

export default router;