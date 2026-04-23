import { Router } from 'express';
import * as tyokohteetController from '../controllers/tyokohteetController';

const router = Router({ mergeParams: true });

// 1. REITTI: Työkohdelista (GET /tyokohteet)
router.get('/', tyokohteetController.listTyokohteet);

// 2. REITTI: Yksittäisen työkohteen tiedot (GET /tyokohteet/:id)
router.get('/:id', tyokohteetController.getTyokohdeDetail);

// 3. REITTI: Lisää työkohde (POST /tyokohteet/lisaa)
router.post('/lisaa', tyokohteetController.createTyokohde);

// 4. REITTI: Poista työkohde (POST /tyokohteet/poista/:id)
router.post('/poista/:id', tyokohteetController.deleteTyokohde);

// 5. REITTI: Hinta-arvio työkohteelle (GET /tyokohteet/:id/hinta-arvio)
router.get('/:id/hinta-arvio', tyokohteetController.getHintaArvio);

export default router;