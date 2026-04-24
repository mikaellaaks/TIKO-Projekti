import { type Request, type Response } from 'express';
import * as TyokohdeModel from '../models/tyokohde';
import * as AsiakasModel from '../models/asiakas';

export const listTyokohteet = async (req: Request, res: Response) => {
    try {
        const [tyokohteet, asiakkaat] = await Promise.all([
            TyokohdeModel.getAll(),
            AsiakasModel.getAll()
        ]);

        res.render('tyokohteet/tyokohteet', {
            title: 'Työkohteet',
            tyokohteet: tyokohteet,
            asiakkaat: asiakkaat
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Virhe haettaessa työkohteita tai asiakkaita.");
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

        res.redirect('/tyokohteet/');
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

        res.redirect('/tyokohteet/');
    } catch (virhe) {
        console.error("Työkohteen poisto epäonnistui:", virhe);
        res.status(500).send("Virhe poistettaessa työkohdetta.");
    }
};

export const getHintaArvio = async (req: Request, res: Response) => {
    try {
        const id = parseInt(String(req.params.id));
        const tyokohde = await TyokohdeModel.getById(id);

        if (!tyokohde) {
            return res.status(404).send('Työkohdetta ei löydy');
        }

        // Haetaan työkohteen tuntityöt
        const tuntityot = await TyokohdeModel.getTuntityot(id);
        
        // Haetaan työkohteen tarvikkeet
        const tarvikkeet = await TyokohdeModel.getTarvikkeet(id);

        // Hinnat
        const hinnat: Record<string, number> = {
            'suunnittelu': 55,
            'työ': 45,
            'aputyö': 35
        };

        // Lasketaan tuntityöt
        let tyo_yhteensa = 0;
        const tuntirivit = tuntityot.map((t: any) => {
            const hinta = t.maara * (hinnat[t.tyyppi] ?? 0);
            tyo_yhteensa += hinta;
            return { nimi: t.tyyppi, maara: t.maara, yksikkohinta: hinnat[t.tyyppi], hinta };
        });

        // Lasketaan tarvikkeet
        let tarvike_yhteensa = 0;
        const tarvikerivit = tarvikkeet.map((t: any) => {
            const hinta = t.maara * t.myyntihinta;
            tarvike_yhteensa += hinta;
            return { nimi: t.nimi, maara: t.maara, yksikkohinta: t.myyntihinta, hinta };
        });

        const alv = (tyo_yhteensa + tarvike_yhteensa) * 0.24;
        const kokonaissumma = tyo_yhteensa + tarvike_yhteensa + alv;

        res.render('tyokohteet/hinta-arvio', {
            title: 'Hinta-arvio',
            tyokohde,
            tulos: {
                tuntirivit,
                tarvikerivit,
                tyo_yhteensa,
                tarvike_yhteensa,
                alv,
                kokonaissumma,
                kotitalousvahennys: tyo_yhteensa
            }
        });
    } catch (virhe) {
        console.error("Virhe hinta-arviossa:", virhe);
        res.status(500).send("Virhe hinta-arvion haussa.");
    }
};