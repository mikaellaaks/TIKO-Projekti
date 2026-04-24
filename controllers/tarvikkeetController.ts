import { type Request, type Response } from 'express';
import { paivitaHinnasto } from '../models/tarvike_import';
import * as TarvikeModel from '../models/tarvike';

export const listTarvikkeet = async (req: Request, res: Response) => {
    try {
        const tarvikkeet = await TarvikeModel.getAll();
        res.render('tarvikkeet/tarvikkeet', { 
            title: 'Tarvikkeet',
            tarvikkeet: tarvikkeet
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Virhe haettaessa tarvikkeita.");
    }
};

export const tuoHinnasto = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send('Ei tiedostoa mukana.');
    }

    try {
        const xmlString = req.file.buffer.toString('utf-8');
        
        // Kutsu tietokantatransaktiota
        const tulos = await paivitaHinnasto(xmlString);
        
        // Jos onnistui, ohjataan takaisin listaukseen (tai näytetään viesti)
        res.redirect('/tarvikkeet');
    } catch (error) {
        console.error('XML tuonti epäonnistui:', error);
        res.status(500).send('Virhe hinnaston päivityksessä.');
    }
};
