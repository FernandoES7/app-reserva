import { Router } from 'express';

import {
    listar,
    promover,
    desactivar,
    actualizarEstado,
} from '../controllers/Empleado.js';

import {
    verificarToken
}
from '../middlewares/Auth.js';

import {
    autorizarRoles
}
from '../middlewares/Roles.js';

const router = Router();

router.get(
    '/',
    verificarToken,
    autorizarRoles(
        'admin',
        'gerente'
    ),
    listar
);

router.post(
    '/promover/:id',
    verificarToken,
    autorizarRoles('admin'),
    promover
);

router.put(
    '/:id/estado',
    verificarToken,
    autorizarRoles('admin'),
    actualizarEstado
);

router.put(
    '/:id/desactivar',
    verificarToken,
    autorizarRoles('admin'),
    desactivar
);

export default router;