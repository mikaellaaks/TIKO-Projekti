import { Router } from 'express';
import * as urakkasopimuksetController from '../controllers/urakkasopimuksetController';

const router = Router();

router.get('/', urakkasopimuksetController.listUrakkasopimukset);
router.post('/lisaa', urakkasopimuksetController.lisaaUrakkasopimus);

// R4: Hae tietty urakkatarjous näytille
router.get('/:id/tarjous', urakkasopimuksetController.getTarjous);

// R5: Urakan hyväksyminen
router.post('/:id/hyvaksy', urakkasopimuksetController.hyvaksyUrakka);

export default router;