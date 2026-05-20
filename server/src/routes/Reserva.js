import { Router } from 'express';
import { crear, getByCodigo } from '../controllers/Reserva.js';

const router = Router();

router.post('/',          crear);
router.get('/:codigo',    getByCodigo);

export default router;