import { Router } from 'express';
import { listar, obtener, actualizar, eliminar } from '../controllers/User.js';
import { verificarToken, soloAdmin } from '../middlewares/Auth.js';

const router = Router();
const admin = [verificarToken, soloAdmin];

router.get('/', admin, listar);
router.get('/:id', admin, obtener);
router.put('/:id', admin, actualizar);
router.delete('/:id', admin, eliminar);

export default router;
