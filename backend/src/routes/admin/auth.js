// Rutas de autenticación

import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../../controllers/adminController/authController.js';

const router = Router();


// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);



export default router;
