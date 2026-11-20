import { Router } from 'express';
import { reasignarLider } from '../../controllers/adminController/gruposController.js';
import auth from '../../middleware/auth.js';
import isAdmin from '../../middleware/isAdmin.js';

const router = Router();

router.put('/:id/lider', auth, isAdmin, reasignarLider);

export default router;
