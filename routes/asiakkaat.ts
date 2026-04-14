import { Router, type Request, type Response } from 'express';

const router = Router();

// Testidata (poistetaan kun saadaan tietokanta kuntoon)
const testiAsiakkaat = [
    { 
        id: "1", 
        nimi: "Matti Meikäläinen", 
        osoite: "Herwood 123", 
        email: "matti@esimerkki.fi",
        puhelinnumero: "045 1234567",
        laskut: [{ id: "l1", nro: 1001, summa: 250 }],
        kohteet: [{ id: "k1", osoite: "Kotikatu 1, Tampere" }]
    },
    { 
        id: "2", 
        nimi: "Yritys Oy", 
        osoite: "Mansesteri 321", 
        email: "info@yritys.fi",
        puhelinnumero: "040 7654321",
        laskut: [{ id: "l2", nro: 1002, summa: 1500 }, { id: "l3", nro: 1003, summa: 400 }],
        kohteet: [{ id: "k2", osoite: "Teollisuustie 5, Nokia" }]
    }
];

// 1. REITTI: Asiakaslista (GET /asiakkaat)
router.get('/', (req: Request, res: Response) => {
    if (testiAsiakkaat == undefined || testiAsiakkaat.length == 0)
    {
        return res.status(404).send("Ei asiakkaita")
    }
    res.render('asiakkaat/asiakkaat', { 
        title: 'Asiakkaat',
        asiakkaat: testiAsiakkaat
    });
});

// 2. REITTI: Yksittäisen asiakkaan tiedot (GET /asiakkaat/:id)
router.get('/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const loytynytAsiakas = testiAsiakkaat.find(a => a.id === id);

    if (!loytynytAsiakas) {
        // Jos id:llä ei löydy ketään
        return res.status(404).send('Asiakasta ei löytynyt');
    }

    res.render('asiakkaat/asiakas', { 
        title: loytynytAsiakas.nimi,
        asiakas: loytynytAsiakas
    });
});

// 3. REITTI: Lisää asiakas
router.post('/lisaa', (req: Request, res: Response) => {
    const uusiAsiakas = req.body;
    
    // Tietokantaan tallennus sitten tänne
    
    res.redirect('/asiakkaat');
});

export default router;