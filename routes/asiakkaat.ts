import { Router } from 'express';
import * as asiakkaatController from '../controllers/asiakkaatController';

const router = Router({ mergeParams: true });

// 1. REITTI: Hae kaikki asiakkaat (GET /asiakkaat)
router.get('/', asiakkaatController.listAsiakkaat);

// 2. REITTI: Yksittäinen asiakas (GET /asiakkaat/:id)
router.get('/:id', asiakkaatController.getAsiakasDetail);

// 3. REITTI: Lisää asiakas (POST /asiakkaat/lisaa)
router.post('/lisaa', asiakkaatController.createAsiakas);

export default router;