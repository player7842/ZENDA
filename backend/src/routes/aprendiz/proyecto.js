import express from 'express';
import auth from '../../middleware/auth.js';
import isAprendiz from '../../middleware/isAprendiz.js';
import {
  crearProyecto,
  unirseAProyecto,
  getMiProyecto,
  crearCarpeta,
  subirEvidencia,
  getCarpetasDeFaseAprendiz,
  getObservacionesDeMiProyecto,
  cambiarMiFicha, // nuevo
  getResumenAprendiz, // NUEVO
  getFichaActual, // NUEVO
} from '../../controllers/aprendizController/proyectoController.js';

// NUEVO — controller de tareas
import {
  crearTarea,
  getTareasDeMiProyecto,
  cambiarEstadoTarea,
  getProgresoTareas,
} from '../../controllers/aprendizController/tareaController.js';

const router = express.Router();

router.post('/', auth, isAprendiz, crearProyecto);
router.post('/unirse', auth, isAprendiz, unirseAProyecto);
router.get('/mio', auth, isAprendiz, getMiProyecto);
router.get('/observaciones', auth, isAprendiz, getObservacionesDeMiProyecto);
router.get('/fases/:faseId/carpetas', auth, isAprendiz, getCarpetasDeFaseAprendiz);
router.post('/fases/:faseId/carpetas', auth, isAprendiz, crearCarpeta);
router.post('/carpetas/:carpetaId/evidencias', auth, isAprendiz, subirEvidencia);
router.get('/mi-ficha', auth, isAprendiz, getFichaActual); // NUEVO
router.put('/mi-ficha', auth, isAprendiz, cambiarMiFicha);

// NUEVO — rutas de tareas
router.post('/tareas', auth, isAprendiz, crearTarea);
router.get('/tareas', auth, isAprendiz, getTareasDeMiProyecto);
router.get('/tareas/progreso', auth, isAprendiz, getProgresoTareas);
router.put('/tareas/:id/estado', auth, isAprendiz, cambiarEstadoTarea);

router.get('/resumen', auth, isAprendiz, getResumenAprendiz); // NUEVO

export default router;