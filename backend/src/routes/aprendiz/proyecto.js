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
  cambiarMiFicha,
  getResumenAprendiz,
  getFichaActual,
} from '../../controllers/aprendizController/proyectoController.js';

// Controlador de tareas de proyecto
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
router.get('/mi-ficha', auth, isAprendiz, getFichaActual);
router.put('/mi-ficha', auth, isAprendiz, cambiarMiFicha);

// Gestión interna de tareas de proyecto
router.post('/tareas', auth, isAprendiz, crearTarea);
router.get('/tareas', auth, isAprendiz, getTareasDeMiProyecto);
router.get('/tareas/progreso', auth, isAprendiz, getProgresoTareas);
router.put('/tareas/:id/estado', auth, isAprendiz, cambiarEstadoTarea);

router.get('/resumen', auth, isAprendiz, getResumenAprendiz);

export default router;