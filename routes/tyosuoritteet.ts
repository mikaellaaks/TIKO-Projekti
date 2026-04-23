import { Router } from 'express';
import * as tyosuoritteetController from '../controllers/tyosuoritteetController';

const router = Router();

// 1. REITTI: Lista työsuoritteista (GET /tyosuoritteet)
router.get('/', tyosuoritteetController.listTyosuoritteet);

// 2. REITTI: Yksittäinen työsuorite (GET /tyosuoritteet/:id)
router.get('/:id', tyosuoritteetController.getTyosuoriteDetail);

// 3. REITTI: Kirjauksen tekeminen (POST /tyosuoritteet/:id/kirjaukset)
router.post('/:id/kirjaukset', tyosuoritteetController.createKirjaus);

export default router;