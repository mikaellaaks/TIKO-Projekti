import { Router, type Request, type Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
      res.render('laskut/laskut', { 
        title: 'Laskut',
    });
})

export default router;
