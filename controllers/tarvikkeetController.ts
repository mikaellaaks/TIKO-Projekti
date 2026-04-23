import { type Request, type Response } from 'express';

export const listTarvikkeet = (req: Request, res: Response) => {
    try {
        res.render('tarvikkeet/tarvikkeet', { 
            title: 'Tarvikkeet',
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Virhe haettaessa tarvikkeita.");
    }
};
