// Rutas de autenticación 
// Todos pueden entrar pero solo si tienen las credenciales correctas.

import { Router } from 'express';
import { register, login } from '../controllers/authController.js';

const router = Router();

// Rutas públicas no se necesita autenticación
router.post('/register', register);
router.post('/login', login);

export default router;
