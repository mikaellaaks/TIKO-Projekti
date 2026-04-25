import { Router } from 'express';
import * as raportitController from '../controllers/raportitController';

const router = Router();

// 1. REITTI: Hae JunkCo raportti (GET /raportit)
router.get('/', raportitController.getJunkCoRaportti);

export default router;

