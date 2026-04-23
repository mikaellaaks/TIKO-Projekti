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
    const lasku = await laskuModel.getFullLaskuDetails(id);

    if (!lasku) {
      return res.status(404).send('Laskua ei löydy');
    }

    const HINNAT = { suunnittelu: 55, työ: 45, aputyö: 35 };

    let tyonOsuusVeroton = 0;
    let tarvikeOsuusVeroton = 0;
    let alv24Summa = 0;
    let alv10Summa = 0;

    // 1. Tuntien laskenta (sisältää alennuksen)
    lasku.tunnit.forEach((t: any) => {
      const perushinta = HINNAT[t.tyyppi as keyof typeof HINNAT] || 0;
      // Muunnetaan alennusprosentti kertoimeksi 
      const alennusKerroin = 1 - (Number(t.alennus_prosentti || 0) / 100);
      
      const riviVeroton = t.maara * perushinta * alennusKerroin;
      tyonOsuusVeroton += riviVeroton;
      
      alv24Summa += riviVeroton * 0.24;
    });

    // 2. Tarvikkeiden laskenta (sisältää alennuksen ja ALV-erittelyn)
    lasku.tarvikkeet.forEach((t: any) => {
      const yksikkohinta = Number(t.myyntihinta);
      const alennusKerroin = 1 - (Number(t.alennus_prosentti || 0) / 100);
      const alvKanta = Number(t.alv || 0.24); // Käytetään tuotteen omaa ALV-kantaa

      const riviVeroton = t.maara * yksikkohinta * alennusKerroin;
      tarvikeOsuusVeroton += riviVeroton;

      // Eritellään ALV-summat 
      if (alvKanta === 0.10) {
        alv10Summa += riviVeroton * 0.10;
      } else {
        alv24Summa += riviVeroton * 0.24;
      }
    });

    const alvYhteensa = alv24Summa + alv10Summa;
    const kokonaissumma = tyonOsuusVeroton + tarvikeOsuusVeroton + alvYhteensa;

    res.render('laskut/lasku', {
      title: `Lasku #${lasku.laskunro}`,
      lasku: lasku,
      tyonOsuusVeroton,
      tarvikeOsuusVeroton,
      alv24Summa,
      alv10Summa,
      alvYhteensa,
      kokonaissumma,
      // Kotitalousvähennys lasketaan työn verollisesta osuudesta (työ + sen alv)
      kotitalousvahennys: tyonOsuusVeroton * 1.24 
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
