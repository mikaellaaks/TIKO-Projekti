import { Router } from 'express';
import * as laskutController from '../controllers/laskutController';

const router = Router();

// 1. REITTI: Laskuista lista (GET /laskut)
router.get('/', laskutController.listLaskut);

// 2. REITTI: Yksittäinen lasku (GET /laskut/:id)
router.get('/:id', laskutController.getLaskuDetail);

// 3. REITTI: Lisää lasku (POST /laskut/lisaa)
router.post('/lisaa', laskutController.createLasku);

// 4. REITTI: Merkitse maksetuksi (POST /laskut/maksettu/:id)
router.post('/maksettu/:id', laskutController.markAsPaid);

export default router;