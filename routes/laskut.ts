import { Router, type Request, type Response } from 'express';
import * as laskuModel from '../models/lasku';

const router = Router();

// 1. REITTI: Laskuista lista (GET /laskut)
router.get('/', async (req: Request, res: Response) => {
  const laskut = await laskuModel.getAll();
  res.render('laskut/laskut', {
    title: 'Laskut',
    laskut: laskut
  });
});

// 2. REITTI: Yksittäinen lasku (GET /laskut/:id)
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const lasku = await laskuModel.getById(id);

  if (!lasku) {
    return res.status(404).send('Laskua ei löydy');
  }

  res.render('laskut/lasku', {
    title: `Lasku #${lasku.laskunro}`,
    lasku: lasku
  });
});

// 3. REITTI: Lisää lasku (POST /laskut/lisaa)
router.post('/lisaa', async (req: Request, res: Response) => {
  await laskuModel.add(req.body);
  res.redirect('/laskut');
});

// 4. REITTI: Merkitse maksetuksi (POST /laskut/maksettu/:id)
router.post('/maksettu/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await laskuModel.updateMaksettu(id);
  res.redirect('/laskut');
});

export default router;