import { Router } from 'express';

import {
    listarFacturas,
    obtenerFactura
} from '../controllers/FacturaController.js';

import {
    verificarToken
} from '../middlewares/Auth.js';

const router = Router();

router.get(
    '/',
    verificarToken,
    listarFacturas
);

router.get(
    '/:id',
    verificarToken,
    obtenerFactura
);

export default router;