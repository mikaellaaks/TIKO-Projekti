import { Router } from 'express';
import * as toimittajatController from '../controllers/toimittajatController';

const router = Router();

// 1. REITTI: Toimittajista lista (GET /toimittajat)
router.get('/', toimittajatController.listToimittajat);

// 2. REITTI: Lisää toimittaja (POST /toimittajat/lisaa)
router.post('/lisaa', toimittajatController.createToimittaja);

// 3. REITTI: Poista toimittaja (POST /toimittajat/poista/:id)
router.post('/poista/:id', toimittajatController.deleteToimittaja);

export default router;