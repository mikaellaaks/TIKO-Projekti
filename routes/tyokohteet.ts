import { Router, type Request, type Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
      res.render('tyokohteet/tyokohteet', { 
        title: 'Työkohteet',
    });
})

export default router;