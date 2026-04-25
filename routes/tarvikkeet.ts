import { Router } from 'express';
import multer from 'multer';
import * as tarvikkeetController from '../controllers/tarvikkeetController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// 1. REITTI: Tarvikkeista lista (GET /tarvikkeet)
router.get('/', tarvikkeetController.listTarvikkeet);

//. 2. REITTI: Tarvikkeiden tuonti hinnastosta
router.post('/tuo-hinnasto', upload.single('hinnasto'), tarvikkeetController.tuoHinnasto);

// 3. REITTI: Arkistoituden tarvikkeiden lista
router.get('/arkistoidut', tarvikkeetController.listArkistoidutTarvikkeet);

// 4. REITTI: Tarvikkeen lisääminen
router.post('/lisaa', tarvikkeetController.createTarvike);

export default router;