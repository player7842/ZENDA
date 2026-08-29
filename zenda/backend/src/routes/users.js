// Rutas de usuarios donde ocurre la magia
// Todas las rutas están protegidas (auth) y solo para admins (isAdmin),
// porque no queremos que randoms modifiquen el code brochacho.
//
// OJO: crear, editar, eliminar y cambiar rol también exigen la contraseña
// del admin logueado dentro del body (verificación extra en el controlador).

import { Router } from 'express';
import { createUser, getUsers, getUserById, updateUser, updateInstructorFichas, deleteUser, updateUserRol } from '../controllers/userController.js';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';

const router = Router();

// Rutas protegidas: necesitas un JWT válido (auth) Y ser admin (isAdmin)
router.post('/', auth, isAdmin, createUser);                     // crear usuario
router.get('/', auth, isAdmin, getUsers);                        // listar todos (con fichas)
router.get('/:id', auth, isAdmin, getUserById);                  // ver uno por ID
router.put('/:id/fichas', auth, isAdmin, updateInstructorFichas); // vincular fichas de instructor
router.put('/:id/rol', auth, isAdmin, updateUserRol);            // cambiar rol (con password)
router.put('/:id', auth, isAdmin, updateUser);                   // editar usuario (con password)
router.delete('/:id', auth, isAdmin, deleteUser);                // eliminar (con password)

export default router;