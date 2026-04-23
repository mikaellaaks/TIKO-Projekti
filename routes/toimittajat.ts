import { Router } from 'express';
import * as toimittajatController from '../controllers/toimittajatController';

const router = Router();

// 1. REITTI: Toimittajista lista (GET /toimittajat)
router.get('/', toimittajatController.listToimittajat);

export default router;