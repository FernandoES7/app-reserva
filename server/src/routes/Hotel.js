import { Router } from 'express';
import { obtener, obtenerPublico, actualizar } from '../controllers/Hotel.js';
import { verificarToken } from '../middlewares/Auth.js';
import { autorizarRoles } from '../middlewares/Roles.js';

const router = Router();
const soloAdmin = [verificarToken, autorizarRoles('admin', 'gerente')];

router.get('/public', obtenerPublico);
router.get('/', ...soloAdmin, obtener);
router.put('/', ...soloAdmin, actualizar);

export default router;
