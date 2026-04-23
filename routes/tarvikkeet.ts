import { Router } from 'express';
import * as tarvikkeetController from '../controllers/tarvikkeetController';

const router = Router();

// 1. REITTI: Tarvikkeista lista (GET /tarvikkeet)
router.get('/', tarvikkeetController.listTarvikkeet);

export default router;