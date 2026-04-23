import { type Request, type Response } from 'express';

export const listToimittajat = (req: Request, res: Response) => {
    try {
        res.render('toimittajat/toimittajat', { 
            title: 'Toimittajat',
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Virhe haettaessa toimittajia.");
    }
};
