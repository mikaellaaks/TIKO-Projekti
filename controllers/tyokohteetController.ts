import { type Request, type Response } from 'express';
import * as TyokohdeModel from '../models/tyokohde';

export const listTyokohteet = async (req: Request, res: Response) => {
    try {
        const tyokohteet = await TyokohdeModel.getAll();
        res.render('tyokohteet/tyokohteet', { 
            title: 'Työkohteet',
            tyokohteet: tyokohteet,
            virheviesti: null
        });
    } catch (virhe) {
        console.error("Virhe haettaessa työkohteita:", virhe);
        res.render('tyokohteet/tyokohteet', { 
            title: 'Työkohteet',
            tyokohteet: [],
            virheviesti: "Tietokantavirhe työkohteita haettaessa."
        });
    }
};

export const getTyokohdeDetail = async (req: Request, res: Response) => {
    try {
        const id = parseInt(String(req.params.id));

        if (isNaN(id)) {
            return res.status(400).send('Virheellinen työkohde-ID');
        }

        const loytynytKohde = await TyokohdeModel.getById(id);

        if (!loytynytKohde) {
            return res.status(404).send('Työkohdetta ei löytynyt');
        }

        res.render('tyokohteet/tyokohde', { 
            title: loytynytKohde.nimi,
            tyokohde: loytynytKohde
        });
    } catch (virhe) {
        console.error("Virhe haettaessa työkohdetta:", virhe);
        res.status(500).send("Virhe haettaessa työkohteen tietoja.");
    }
};

export const createTyokohde = async (req: Request, res: Response) => {
    try {
        const { nimi, osoite, asiakas_id } = req.body;

        await TyokohdeModel.add({
            nimi,
            osoite,
            asiakas_id: parseInt(asiakas_id)
        });

        res.redirect('/asiakkaat/' + asiakas_id);
    } catch (virhe) {
        console.error("Työkohteen lisäys epäonnistui:", virhe);
        res.status(500).send("Virhe tallennettaessa työkohdetta.");
    }
};

export const deleteTyokohde = async (req: Request, res: Response) => {
    try {
        const id = parseInt(String(req.params.id));
        const { asiakas_id } = req.body;

        await TyokohdeModel.remove(id);

        res.redirect('/asiakkaat/' + asiakas_id);
    } catch (virhe) {
        console.error("Työkohteen poisto epäonnistui:", virhe);
        res.status(500).send("Virhe poistettaessa työkohdetta.");
    }
};