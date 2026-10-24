// Rutas de autenticación

import { Router } from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  refresh,
  logout,
} from '../../controllers/adminController/authController.js';

const router = Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
