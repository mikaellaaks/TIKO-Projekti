import { type Request, type Response } from 'express';
import * as laskuModel from '../models/lasku';

export const listLaskut = async (req: Request, res: Response) => {
  try {
    const laskut = await laskuModel.getAll();
    res.render('laskut/laskut', {
      title: 'Laskut',
      laskut: laskut
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Virhe haettaessa laskuja.");
  }
};

export const getLaskuDetail = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    //  laajennettu hakufunktio
    const lasku = await laskuModel.getFullLaskuDetails(id);

    if (!lasku) {
      return res.status(404).send('Laskua ei löydy');
    }

    const HINNAT = { suunnittelu: 55, työ: 45, aputyö: 35 };

    // tuntien yhteissumma (Kotitalousvähennyskelpoinen osuus)
    const tyonOsuus = lasku.tunnit.reduce((sum: number, t: any) => {
      const hinta = HINNAT[t.tyyppi as keyof typeof HINNAT] || 0;
      return sum + (t.maara * hinta);
    }, 0);

    // Laske tarvikkeiden yhteissumma
    const tarvikeOsuus = lasku.tarvikkeet.reduce((sum: number, t: any) => {
      return sum + (t.maara * Number(t.myyntihinta));
    }, 0);

    const kokonaissumma = tyonOsuus + tarvikeOsuus;

    res.render('laskut/lasku', {
      title: `Lasku #${lasku.laskunro}`,
      lasku: lasku,
      tyonOsuus,  // Kotitalousvähennyskelpoinen summa
      tarvikeOsuus,
      kokonaissumma,
      alvOsuus: kokonaissumma * 0.24
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Virhe haettaessa laskun tietoja.");
  }
};

export const createLasku = async (req: Request, res: Response) => {
  try {
    await laskuModel.add(req.body);
    res.redirect('/laskut');
  } catch (error) {
    console.error(error);
    res.status(500).send("Virhe tallennettaessa laskua.");
  }
};

export const markAsPaid = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await laskuModel.updateMaksettu(id);
    res.redirect('/laskut');
  } catch (error) {
    console.error(error);
    res.status(500).send("Virhe päivitettäessä laskun tilaa.");
  }
};
