import { Router } from 'express';
import { getDashboard } from '../controllers/Stats.js';
import { verificarToken } from '../middlewares/Auth.js';
import { autorizarRoles } from '../middlewares/Roles.js';

const router = Router();

router.get(
    '/dashboard',
    verificarToken,
    autorizarRoles('admin', 'gerente', 'recepcion'),
    getDashboard
);

export default router;
