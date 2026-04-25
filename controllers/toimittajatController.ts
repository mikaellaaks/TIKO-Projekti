import { type Request, type Response } from 'express';
import * as ToimittajaModel from '../models/toimittaja';

// Muodosta lista kaikista toimittajista
export const listToimittajat = async (req: Request, res: Response) => {
    try {
        const toimittajat = await ToimittajaModel.getAll();
        res.render('toimittajat/toimittajat', { 
            title: 'Toimittajat',
            toimittajat: toimittajat
        });
    } catch (virhe) {
        console.error(virhe);
        res.status(500).send("Tietokantavirhe");
    }
};

// Luo uusi toimittaja
export const createToimittaja = async (req: Request, res: Response) => {
    try {
        const { nimi } = req.body;

        if (!nimi) {
                return res.status(400).send("Pakollisia kenttiä puuttuu");
        }

        await ToimittajaModel.add({
            nimi: nimi
        });
        res.redirect('/toimittajat');
    } catch (virhe) {
        console.error(virhe);
        res.status(500).send("Virhe toimittajan lisäämisessä");
    }
};

// Poista toimittaja
export const deleteToimittaja = async (req: Request, res: Response) => {
    try {
        const id = parseInt(String(req.params.id));
        const { toimittaja_id } = req.body;

        await ToimittajaModel.remove(id);

        res.redirect('/toimittajat');
    } catch (virhe) {
        console.error("Toimittajan poisto epäonnistui:", virhe);
        res.status(500).send("Virhe poistettaessa toimittajaa.");
    }
};
