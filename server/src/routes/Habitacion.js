import { Router } from 'express';
import { getDisponibles, getTodos } from '../controllers/Habitacion.js';

const router = Router();

router.get('/tipos',       getTodos);
router.get('/disponibles', getDisponibles);

export default router;