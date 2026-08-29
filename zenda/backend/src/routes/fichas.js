// Rutas de fichas y programas
// Todas están protegidas (auth) y solo para admins (isAdmin).
// La ruta /programas va antes de /:id para que no la capture el param.

import { Router } from 'express';
import {
  getFichas, getProgramas, createFicha, updateFicha, deleteFicha,
  addAprendizAFicha, removeAprendizDeFicha
} from '../controllers/fichasController.js';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';

const router = Router();

router.get('/programas', auth, isAdmin, getProgramas);                  // programas para el formulario
router.get('/', auth, isAdmin, getFichas);                             // listar fichas (con conteos)
router.post('/', auth, isAdmin, createFicha);                          // crear ficha (con password)
router.put('/:id/aprendiz', auth, isAdmin, addAprendizAFicha);         // vincular aprendiz a la ficha
router.delete('/:id/aprendiz/:usuario_id', auth, isAdmin, removeAprendizDeFicha); // desvincular aprendiz
router.put('/:id', auth, isAdmin, updateFicha);                        // editar ficha
router.delete('/:id', auth, isAdmin, deleteFicha);                     // eliminar ficha

export default router;