import { Router } from 'express';

import {
    registrarPago,
    listarPagos,
    pagosFactura
} from '../controllers/PagoController.js';

import {
    verificarToken
} from '../middlewares/Auth.js';

const router = Router();

router.post(
    '/',
    verificarToken,
    registrarPago
);

router.get(
    '/',
    verificarToken,
    listarPagos
);

router.get(
    '/factura/:idFactura',
    verificarToken,
    pagosFactura
);

export default router;