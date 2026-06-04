import { Router } from 'express';
import {
  listar,
  listarMias,
  getById,
  actualizarEstado,
  cancelar,
} from '../controllers/Reserva.js';
import { verificarToken, soloAdmin } from '../middlewares/Auth.js';

const router = Router();

router.get('/', verificarToken, soloAdmin, listar);
router.get('/mine', verificarToken, listarMias);
router.get('/:id', verificarToken, getById);
router.put('/:id/cancel', verificarToken, cancelar);
router.put('/:id', verificarToken, soloAdmin, actualizarEstado);

export default router;
