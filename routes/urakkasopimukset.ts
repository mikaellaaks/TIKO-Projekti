import { Router } from 'express';
import * as urakkasopimuksetController from '../controllers/urakkasopimuksetController';

const router = Router();

// R1: Urakkasopimusten lista
router.get('/', urakkasopimuksetController.listUrakkasopimukset);

// R2: Uuden urakkasopimuksen luominen
router.post('/lisaa', urakkasopimuksetController.lisaaUrakkasopimus);

// R3: Hae tietty urakkatarjous näytille
router.get('/:id/tarjous', urakkasopimuksetController.getTarjous);

// R4: Urakan hyväksyminen
router.post('/:id/hyvaksy', urakkasopimuksetController.hyvaksyUrakka);

export default router;