import express from 'express';
import auth from '../../middleware/auth.js';
import isInstructor from '../../middleware/isInstructor.js';
import { getMisFichas, getAprendicesDeFicha, getGruposDeFicha, getReadmeProyecto, getCarpetasDeFase, evaluarEvidencia, getEvidenciasDeFicha, getObservacionesDeProyecto, crearObservacion } from '../../controllers/instructorController/instructorController.js';

const router = express.Router();

router.get('/fichas', auth, isInstructor, getMisFichas);
router.get('/fichas/:id/aprendices', auth, isInstructor, getAprendicesDeFicha);
router.get('/fichas/:id/grupos', auth, isInstructor, getGruposDeFicha);
router.get('/proyectos/:proyectoId', auth, isInstructor, getReadmeProyecto);
router.get('/fases/:faseId/carpetas', auth, isInstructor, getCarpetasDeFase);
router.post('/evidencias/:evidenciaId/evaluar', auth, isInstructor, evaluarEvidencia);
router.get('/fichas/:id/evidencias', auth, isInstructor, getEvidenciasDeFicha);
router.get('/proyectos/:proyectoId/observaciones', auth, isInstructor, getObservacionesDeProyecto);
router.post('/proyectos/:proyectoId/observaciones', auth, isInstructor, crearObservacion);

export default router;