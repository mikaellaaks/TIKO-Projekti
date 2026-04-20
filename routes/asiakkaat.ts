import { Router, type Request, type Response } from 'express';
import * as AsiakasModel from '../models/asiakas';
import * as TyokohdeModel from '../models/tyokohde';

const router = Router({ mergeParams: true });

/**
 * 1. REITTI: Asiakaslista
 * Haetaan kaikki asiakkaat tietokannasta ja näytetään ne taulukossa.
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const asiakkaat = await AsiakasModel.getAll();
        
        res.render('asiakkaat/asiakkaat', { 
            title: 'Asiakkaat',
            asiakkaat: asiakkaat
        });
    } catch (virhe) {
        console.error("Virhe haettaessa asiakkaita:", virhe);
        res.status(500).send("Tietokantavirhe asiakkaita haettaessa");
    }
});

/**
 * 2. REITTI: Yksittäisen asiakkaan tiedot
 * Haetaan asiakas ID:n perusteella.
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(String(req.params.id));

        if (isNaN(id)) {
            return res.status(400).send('Virheellinen asiakas-ID');
        }

        // 1. Haetaan asiakkaan tiedot
        const loytynytAsiakas = await AsiakasModel.getById(id);

        if (!loytynytAsiakas) {
            return res.status(404).send('Asiakasta ei löytynyt');
        }

        // 2. HAETAAN TYÖKOHTEET: Haetaan kaikki tähän asiakkaaseen liittyvät kohteet
        // Tämä vaatii, että models/tyokohde.ts tiedostossa on getByAsiakasId-funktio
        const tyokohteet = await TyokohdeModel.getByAsiakas(id);

        // 3. LÄHETETÄÄN TIEDOT: Nyt 'tyokohteet' on käytettävissä asiakas.ejs-tiedostossa
        res.render('asiakkaat/asiakas', { 
            title: loytynytAsiakas.nimi,
            asiakas: loytynytAsiakas,
            tyokohteet: tyokohteet || [] // Varmistetaan, että se on vähintään tyhjä lista
        });
        
    } catch (virhe) {
        console.error("Virhe haettaessa asiakkaan tietoja ja työkohteita:", virhe);
        res.status(500).send("Virhe haettaessa asiakasta");
    }
});

/**
 * 3. REITTI: Lisää asiakas
 * Ottaa vastaan datan modal-lomakkeelta ja tallentaa sen kantaan.
 */
router.post('/lisaa', async (req: Request, res: Response) => {
    try {
        // req.body:n nimet tulevat EJS-lomakkeen <input name="..."> attribuuteista
        const { nimi, osoite, email, puhelinnro } = req.body;

        // Validointi: varmistetaan että pakolliset tiedot on saatu
        if (!nimi || !email || !osoite) {
            return res.status(400).send("Nimi, osoite ja sähköposti ovat pakollisia kenttiä.");
        }

        // Kutsutaan modelia. Huomaa mapping: email -> sahkoposti
        await AsiakasModel.add({
            nimi: nimi,
            osoite: osoite,
            sahkoposti: email, 
            puhelinnro: puhelinnro
        });

        // Tallennuksen jälkeen ohjataan takaisin listaukseen
        res.redirect('/asiakkaat');
    } catch (virhe) {
        console.error("Asiakkaan lisäys epäonnistui:", virhe);
        res.status(500).send("Asiakkaan tallennus epäonnistui tietokantavirheen vuoksi.");
    }
});

export default router;