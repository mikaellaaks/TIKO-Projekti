import { type Request, type Response } from 'express';
import * as laskuModel from '../models/lasku';
import * as asiakasModel from '../models/asiakas';
import * as tyokohdeModel from '../models/tyokohde';
import pool from '../db';

export const listLaskut = async (req: Request, res: Response) => {
  try {
    const laskut = await laskuModel.getAll();
    const asiakkaat = await asiakasModel.getAll();
    const tyokohteet = await tyokohdeModel.getAll();
    res.render('laskut/laskut', {
      title: 'Laskut',
      laskut: laskut,
      asiakkaat: asiakkaat,
      tyokohteet: tyokohteet,
      message: req.query.msg || null
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

    let tyonOsuusVeroton = 0;
    let tarvikeOsuusVeroton = 0;
    let alv24Summa = 0;
    let alv10Summa = 0;
    let tyonAlvSumma = 0;

    // 1. Tuntien laskenta — käytetään tietokannan yksikköhintaa kovakoodatun sijaan
    const tuntiErittely = lasku.tunnit.map((t: any) => {
      const yksikkohinta = Number(t.yksikkohinta || 0);
      const alennusProsentti = Number(t.alennus_prosentti || 0);
      const alennusKerroin = 1 - alennusProsentti / 100;

      const alkuperainenVeroton = t.maara * yksikkohinta;
      const riviVeroton = alkuperainenVeroton * alennusKerroin;
      const alvKanta = Number(t.alv || 24) / 100;

      tyonOsuusVeroton += riviVeroton;
      alv24Summa += riviVeroton * alvKanta;
      tyonAlvSumma += riviVeroton * alvKanta;
      return {
        ...t,
        yksikkohinta,
        alkuperainenVeroton,
        alennusProsentti,
        riviVeroton,
        alvKanta,
      };
    });

    // 2. Tarvikkeiden laskenta
    const tarvikeErittely = lasku.tarvikkeet.map((t: any) => {
      const yksikkohinta = Number(t.myyntihinta || 0);
      const alennusProsentti = Number(t.alennus_prosentti || 0);
      const alennusKerroin = 1 - alennusProsentti / 100;
      const alvKanta = Number(t.alv || 0.24) / 100;

      const alkuperainenVeroton = t.maara * yksikkohinta;
      const riviVeroton = alkuperainenVeroton * alennusKerroin;

      tarvikeOsuusVeroton += riviVeroton;

      if (alvKanta === 0.10) {
        alv10Summa += riviVeroton * 0.10;
      } else {
        alv24Summa += riviVeroton * alvKanta;
      }

      return {
        ...t,
        yksikkohinta,
        alkuperainenVeroton,
        alennusProsentti,
        riviVeroton,
        alvKanta,
      };
    });

    const alvYhteensa = alv24Summa + alv10Summa;
    const kokonaissumma = tyonOsuusVeroton + tarvikeOsuusVeroton + alvYhteensa;

    const tyonOsuusVerollinen = tyonOsuusVeroton + tyonAlvSumma;
    const kotitalousvahennyskelpoinen = tyonOsuusVerollinen * 0.35;
    

    res.render('laskut/lasku', {
      title: `Lasku #${lasku.laskunro}`,
      lasku,
      tuntiErittely,  
      tarvikeErittely,    
      tyonOsuusVeroton,
      tarvikeOsuusVeroton,
      alv24Summa,
      alv10Summa,
      alvYhteensa,
      kokonaissumma,
      kotitalousvahennyskelpoinen, 
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Virhe haettaessa laskun tietoja.");
  }
};

export const createLasku = async (req: Request, res: Response) => {
  try {
    const { asiakas_id, tyokohde_id, ...laskuData } = req.body;
    const uusiLasku = await laskuModel.add(laskuData);
    
    if (asiakas_id && tyokohde_id) {
      await pool.query(
        `INSERT INTO tyosuorite (asiakas_id, tyokohde_id, lasku_id, tyyppi) VALUES ($1, $2, $3, 'tunti')`,
        [asiakas_id, tyokohde_id, uusiLasku.lasku_id]
      );
    }

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

export const createReminders = async (req: Request, res: Response) => {
  try {
    const uudetLaskut = await laskuModel.addMuistutusLasku();
    const msg = `Luotiin ${uudetLaskut.length} uutta muistutus/karhulaskua.`;
    console.log(msg);
    res.redirect('/laskut?msg=' + encodeURIComponent(msg));
  } catch (error) {
    console.error("Virhe muistutuslaskujen luonnissa:", error);
    res.redirect('/laskut?msg=' + encodeURIComponent('Virhe muistutuslaskujen käsittelyssä.'));
  }
};

export const naytaLasku = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const laskuData = await laskuModel.getFullLaskuDetails(id);

        if (!laskuData) {
            return res.status(404).send("Laskua ei löytynyt.");
        }

        res.render('laskut/lasku_sivu', {
            title: `Lasku #${laskuData.laskunro}`,
            lasku: laskuData
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Virhe haettaessa laskun tietoja.");
    }
};
