import { Router, type Request, type Response } from 'express';
import * as tyosuoriteModel from '../models/tyosuorite';

const router = Router();

// 1. REITTI: Lista työsuoritteista (GET /tyosuoritteet)
router.get('/', async (req: Request, res: Response) => {
  const tyosuoritteet = await tyosuoriteModel.getAll();
  res.render('tyosuoritteet/tyosuoritteet', {
    title: 'Työsuoritteet',
    tyosuoritteet: tyosuoritteet
  });
});

// 2. REITTI: Yksittäinen työsuorite (GET /tyosuoritteet/:id)
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const tyosuorite = await tyosuoriteModel.getById(id);

  if (!tyosuorite) {
    return res.status(404).send('Työsuoritetta ei löydy');
  }

  res.render('tyosuoritteet/tyosuorite', {
    title: `Työsuorite #${id}`,
    tyosuorite: tyosuorite
  });
});
