import { Router } from 'express';
import multer from 'multer';
import * as tarvikkeetController from '../controllers/tarvikkeetController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// 1. REITTI: Tarvikkeista lista (GET /tarvikkeet)
router.get('/', tarvikkeetController.listTarvikkeet);
router.post('/tuo-hinnasto', upload.single('hinnasto'), tarvikkeetController.tuoHinnasto);

export default router;