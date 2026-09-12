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
} from '../../controllers/aprendizController/proyectoController.js';

const router = express.Router();

router.post('/', auth, isAprendiz, crearProyecto);
router.post('/unirse', auth, isAprendiz, unirseAProyecto);
router.get('/mio', auth, isAprendiz, getMiProyecto);
router.get('/observaciones', auth, isAprendiz, getObservacionesDeMiProyecto);
router.get('/fases/:faseId/carpetas', auth, isAprendiz, getCarpetasDeFaseAprendiz);
router.post('/fases/:faseId/carpetas', auth, isAprendiz, crearCarpeta);
router.post('/carpetas/:carpetaId/evidencias', auth, isAprendiz, subirEvidencia);
router.put('/mi-ficha', auth, isAprendiz, cambiarMiFicha);

export default router;