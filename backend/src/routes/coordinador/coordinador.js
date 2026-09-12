// Rutas del panel coordinador — solo lectura de fichas/instructores ADSO
// + asignar instructores a esas fichas. Protegidas con auth + isCoordinador.

import { Router } from 'express';
import {
  getFichasCoordinador,
  getInstructoresCoordinador,
  updateFichasInstructorCoordinador,
} from '../../controllers/coordinadorController/coordinadorController.js';
import auth from '../../middleware/auth.js';
import isCoordinador from '../../middleware/isCoordinador.js';

const router = Router();

router.get('/fichas', auth, isCoordinador, getFichasCoordinador);
router.get('/instructores', auth, isCoordinador, getInstructoresCoordinador);
router.put('/instructores/:id/fichas', auth, isCoordinador, updateFichasInstructorCoordinador);

export default router;