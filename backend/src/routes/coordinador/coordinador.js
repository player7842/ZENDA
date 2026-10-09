import express from 'express';
import auth from '../../middleware/auth.js';
import isCoordinador from '../../middleware/isCoordinador.js';
import {
  getFichasCoordinador,
  getInstructoresCoordinador,
  updateFichasInstructorCoordinador,
  getDashboardCoordinador,
  getGruposCoordinador,
  getProyectosCoordinador,
  getSeguimientoProyecto,
  getPerfilCoordinador,
} from '../../controllers/coordinadorController/coordinadorController.js';

const router = express.Router();

router.get('/dashboard', auth, isCoordinador, getDashboardCoordinador);
router.get('/fichas', auth, isCoordinador, getFichasCoordinador);
router.get('/instructores', auth, isCoordinador, getInstructoresCoordinador);
router.put('/instructores/:id/fichas', auth, isCoordinador, updateFichasInstructorCoordinador);
router.get('/grupos', auth, isCoordinador, getGruposCoordinador);
router.get('/proyectos', auth, isCoordinador, getProyectosCoordinador);
router.get('/proyectos/:id/seguimiento', auth, isCoordinador, getSeguimientoProyecto);
router.get('/perfil', auth, isCoordinador, getPerfilCoordinador);

export default router;