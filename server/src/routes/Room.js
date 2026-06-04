import { Router } from 'express';
import { listar, obtener, crear, actualizar, eliminar } from '../controllers/Room.js';
import { verificarToken, soloAdmin } from '../middlewares/Auth.js';

const router = Router();

const admin = [verificarToken, soloAdmin];

router.get('/', listar);
router.get('/:id', obtener);
router.post('/', admin, crear);
router.put('/:id', admin, actualizar);
router.delete('/:id', admin, eliminar);

export default router;
