import { Router } from 'express';
import {
  getDisponibles,
  getTodos,
  getTodosAdmin,
  crearTipo,
  actualizarTipo,
  eliminarTipo,
  getUnidadesPorTipo,
  crearUnidad,
  actualizarUnidad,
  eliminarUnidad,
} from '../controllers/Habitacion.js';
import { verificarToken } from '../middlewares/Auth.js';
import { autorizarRoles } from '../middlewares/Roles.js';

const router = Router();
const soloAdmin = [verificarToken, autorizarRoles('admin', 'gerente')];

router.get('/tipos', getTodos);
router.get('/tipos/admin', ...soloAdmin, getTodosAdmin);
router.post('/tipos', ...soloAdmin, crearTipo);
router.put('/tipos/:id', ...soloAdmin, actualizarTipo);
router.delete('/tipos/:id', ...soloAdmin, eliminarTipo);
router.get('/tipos/:id/unidades', ...soloAdmin, getUnidadesPorTipo);
router.post('/tipos/:id/unidades', ...soloAdmin, crearUnidad);
router.put('/unidades/:id', ...soloAdmin, actualizarUnidad);
router.delete('/unidades/:id', ...soloAdmin, eliminarUnidad);
router.get('/disponibles', getDisponibles);

export default router;
