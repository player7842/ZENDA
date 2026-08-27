// Rutas de usuarios donde ocurre la magia
// Todas las rutas están protegidas porque no queremos que randoms modifiquen el code brochacho

import { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const router = Router();

// Rutas protegidas necesita un JWT válido para entrar
router.get('/', auth, getUsers);
router.get('/:id', auth, getUserById);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser);

export default router;
