import { type Request, type Response } from 'express';
import { paivitaHinnasto } from '../models/tarvike_import';
import * as TarvikeModel from '../models/tarvike';
import * as TarvikeHistoriaModel from '../models/tarvike_historia';
import * as ToimittajaModel from '../models/toimittaja';

// Muodosta lista kaikista tarvikkeista
export const listTarvikkeet = async (req: Request, res: Response) => {
    try {
        const tarvikkeet = await TarvikeModel.getAll();
        const toimittajat = await ToimittajaModel.getAll();
        res.render('tarvikkeet/tarvikkeet', { 
            title: 'Tarvikkeet',
            tarvikkeet: tarvikkeet,
            toimittaja: toimittajat
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Virhe haettaessa tarvikkeita.");
    }
};

// Päivitä tarvikehinnasto XML-formaatissa olevasta hinnastotiedostosta
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

// Listaa arkistoidut tarvikkeet
export const listArkistoidutTarvikkeet = async (req: Request, res: Response) => {
    try {
        const arkistoidut = await TarvikeHistoriaModel.getAll();
        res.render('tarvikkeet/arkistoidut', {
            title: 'Arkistoidut tarvikkeet',
            tarvikkeet: arkistoidut
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Virhe haettaessa arkistoituja tarvikkeita.");
    }
};

// Lisää uusi tarvike
export const createTarvike = async (req: Request, res: Response) => {
    try {
        const { nimi, merkki, yksikko, saldo, sisaanostohinta, myyntihinta, alv, toimittaja_id } = req.body;

        if (!nimi || !merkki || !yksikko) {
            return res.status(400).send("Pakollisia kenttiä puuttuu");
        }

        await TarvikeModel.add({
            nimi: nimi,
            merkki: merkki,
            yksikko: yksikko,
            saldo: saldo,
            sisaanostohinta: sisaanostohinta,
            myyntihinta: myyntihinta,
            alv: alv,
            toimittaja_id: toimittaja_id
        });

        res.redirect('/tarvikkeet');
    } catch (virhe) {
        console.error(virhe);
        res.status(500).send("Virhe");
    }
};
