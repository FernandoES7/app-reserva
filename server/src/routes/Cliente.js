import { Router } from 'express';

import {
    listar
} from '../controllers/Cliente.js';

import {
    verificarToken
} from '../middlewares/Auth.js';

import {
    autorizarRoles
} from '../middlewares/Roles.js';

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

export default router;