import { Router } from 'express';
import * as raportitController from '../controllers/raportitController';

const router = Router();

router.get('/', raportitController.getJunkCoRaportti);

export default router;

