// Rutas para la administración de usuarios.
// Todas las rutas requieren autenticación (auth) y rol de administrador (isAdmin).
//
// Las operaciones críticas (crear, editar, eliminar y cambiar rol) exigen la contraseña
// del administrador en el cuerpo de la petición como medida de seguridad adicional.

import { Router } from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateInstructorFichas,
  deleteUser,
  updateUserRol,
} from '../../controllers/adminController/userController.js';
import auth from '../../middleware/auth.js';
import isAdmin from '../../middleware/isAdmin.js';

const router = Router();

// Rutas protegidas: necesitas un JWT válido (auth) Y ser admin (isAdmin)
router.post('/', auth, isAdmin, createUser); // crear usuario
router.get('/', auth, isAdmin, getUsers); // listar todos (con fichas)
router.get('/:id', auth, isAdmin, getUserById); // ver uno por ID
router.put('/:id/fichas', auth, isAdmin, updateInstructorFichas); // vincular fichas de instructor
router.put('/:id/rol', auth, isAdmin, updateUserRol); // cambiar rol (con password)
router.put('/:id', auth, isAdmin, updateUser); // editar usuario (con password)
router.delete('/:id', auth, isAdmin, deleteUser); // eliminar (con password)

export default router;
