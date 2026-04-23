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
    const lasku = await laskuModel.getById(id);

    if (!lasku) {
      return res.status(404).send('Laskua ei löydy');
    }

    res.render('laskut/lasku', {
      title: `Lasku #${lasku.laskunro}`,
      lasku: lasku
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
