import { Router, type Request, type Response } from 'express';
import * as tyokohdeModel from '../models/tyokohde';

const router = Router();

// 1. REITTI: Työkohdelista (GET /tyokohteet)
router.get('/', async (req: Request, res: Response) => {
  const tyokohteet = await tyokohdeModel.getAll();

  if (!tyokohteet || tyokohteet.length === 0) {
    return res.status(404).send('Ei työkohteita');
  }

  res.render('tyokohteet/tyokohteet', {
    title: 'Työkohteet',
    tyokohteet: tyokohteet
  });
});

// 2. REITTI: Yksittäinen työkohde (GET /tyokohteet/:id)
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const tyokohde = await tyokohdeModel.getById(id);

  if (!tyokohde) {
    return res.status(404).send('Työkohdetta ei löydy');
  }

  res.render('tyokohteet/tyokohde', {
    title: tyokohde.nimi,
    tyokohde: tyokohde
  });
});

// 3. REITTI: Lisää työkohde (T1)
router.post('/lisaa', async (req: Request, res: Response) => {
  await tyokohdeModel.add(req.body);
  res.redirect('/asiakkaat/' + req.body.asiakas_id);
});

export default router;