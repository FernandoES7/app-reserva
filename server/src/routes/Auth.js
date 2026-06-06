import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, me } from '../controllers/Auth.js';
import { verificarToken } from '../middlewares/Auth.js';

const router = Router();

router.post('/register',        register);
router.post('/login',           login);
router.get('/me',               verificarToken, me);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

export default router;
