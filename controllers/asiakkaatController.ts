import { type Request, type Response } from 'express';
import * as AsiakasModel from '../models/asiakas';
import * as TyokohdeModel from '../models/tyokohde';

export const listAsiakkaat = async (req: Request, res: Response) => {
    try {
        const asiakkaat = await AsiakasModel.getAll();
        res.render('asiakkaat/asiakkaat', { 
            title: 'Asiakkaat',
            asiakkaat: asiakkaat
        });
    } catch (virhe) {
        console.error(virhe);
        res.status(500).send("Tietokantavirhe");
    }
};

export const getAsiakasDetail = async (req: Request, res: Response) => {
    try {
        const id = parseInt(String(req.params.id));

        if (isNaN(id)) {
            return res.status(400).send('Virheellinen ID');
        }

        const loytynytAsiakas = await AsiakasModel.getById(id);

        if (!loytynytAsiakas) {
            return res.status(404).send('Ei löytynyt');
        }

        const tyokohteet = await TyokohdeModel.getByAsiakas(id);

        res.render('asiakkaat/asiakas', { 
            title: loytynytAsiakas.nimi,
            asiakas: loytynytAsiakas,
            tyokohteet: tyokohteet || []
        });
    } catch (virhe) {
        console.error(virhe);
        res.status(500).send("Virhe");
    }
};

export const createAsiakas = async (req: Request, res: Response) => {
    try {
        const { nimi, osoite, email, puhelinnro } = req.body;

        if (!nimi || !email || !osoite) {
            return res.status(400).send("Pakollisia kenttiä puuttuu");
        }

        await AsiakasModel.add({
            nimi: nimi,
            osoite: osoite,
            sahkoposti: email, 
            puhelinnro: puhelinnro
        });

        res.redirect('/asiakkaat');
    } catch (virhe) {
        console.error(virhe);
        res.status(500).send("Virhe");
    }
};