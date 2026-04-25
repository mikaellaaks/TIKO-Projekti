import { type Request, type Response } from 'express';
import * as urakkasopimusModel from '../models/urakkasopimus';
import * as asiakasModel from '../models/asiakas';
import * as tyokohdeModel from '../models/tyokohde';

// Muodosta lista kaikista urakkasopimuksista
export const listUrakkasopimukset = async (req: Request, res: Response) => {
    try {
        const urakkasopimukset = await urakkasopimusModel.getAll();
        const asiakkaat = await asiakasModel.getAll();
        const tyokohteet = await tyokohdeModel.getAll();
        res.render('urakkasopimukset/urakkasopimukset', { 
            title: 'Urakkasopimukset',
            urakkasopimukset: urakkasopimukset,
            asiakkaat: asiakkaat,
            tyokohteet: tyokohteet,
            virheviesti: null
        });
    } catch (virhe) {
        console.error("Virhe haettaessa urakkasopimuksia:", virhe);
        res.render('urakkasopimukset/urakkasopimukset', { 
            title: 'Urakkasopimukset',
            urakkasopimukset: [],
            asiakkaat: [],
            tyokohteet: [],
            virheviesti: "Tietokantavirhe urakkasopimuksia haettaessa."
        });
    }
};

// Luo uusi urakkasopimus
export const lisaaUrakkasopimus = async (req: Request, res: Response) => {
    try {
        const { asiakas_id, tyokohde_id, suunnittelu_tunnit, tyo_tunnit, alennus_prosentti } = req.body;
        await urakkasopimusModel.add({
            asiakas_id: Number(asiakas_id),
            tyokohde_id: Number(tyokohde_id),
            suunnittelu_tunnit: Number(suunnittelu_tunnit),
            tyo_tunnit: Number(tyo_tunnit),
            alennus_prosentti: alennus_prosentti ? Number(alennus_prosentti) : 10,
            hyvaksytty: false
        });
        res.redirect('/urakkasopimukset');
    } catch (error) {
        console.error("Virhe lisättäessä urakkaa:", error);
        res.redirect('/urakkasopimukset?virhe=lisays');
    }
};

// Laske kokonaiskustannus urakkasopimukselle
export const laskeKokonaisKustannus = (urakkaRaportti: any) => {
    const SUUNNITTELU_HINTA_ALV = 55;
    const TYOMASENNUS_HINTA_ALV = 45;
    const ALV_KERROIN = 1.24;

    const suunnitteluEiAlv = (SUUNNITTELU_HINTA_ALV / ALV_KERROIN) * urakkaRaportti.suunnittelu_tunnit;
    const tyoEiAlv = (TYOMASENNUS_HINTA_ALV / ALV_KERROIN) * urakkaRaportti.tyo_tunnit;

    const alennus = (urakkaRaportti.alennus_prosentti || 10) / 100;
    const tyonYhteensaEiAlv = (suunnitteluEiAlv + tyoEiAlv) * (1 - alennus);
    const tyonAlvOsuus = tyonYhteensaEiAlv * 0.24;
    const tyonYhteensaAlvilla = tyonYhteensaEiAlv + tyonAlvOsuus;

    let tarvikkeetEiAlv = 0;
    let tarvikkeetAlvOsuus = 0;

    urakkaRaportti.tarvikkeet.forEach((t: any) => {
      const hintaEiAlv = Number(t.myyntihinta) * t.maara;
      const alvOsuus = hintaEiAlv * (Number(t.alv) / 100);
      tarvikkeetEiAlv += hintaEiAlv;
      tarvikkeetAlvOsuus += alvOsuus;
    });

    const tarvikkeetYhteensaAlvilla = tarvikkeetEiAlv + tarvikkeetAlvOsuus;
    const kokonaisKustannus = tyonYhteensaAlvilla + tarvikkeetYhteensaAlvilla;

    return {
        tyonYhteensaEiAlv,
        tyonAlvOsuus,
        tyonYhteensaAlvilla,
        tarvikkeetEiAlv,
        tarvikkeetAlvOsuus,
        tarvikkeetYhteensaAlvilla,
        kokonaisKustannus
    };
};

// Muodosta tarjous urakkasopimuksesta
export const getTarjous = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const urakkaRaportti = await urakkasopimusModel.getUrakkaRaportti(id);

    if (!urakkaRaportti) {
      return res.status(404).send('Urakkatarjousta ei löydy');
    }

    const laskelmat = laskeKokonaisKustannus(urakkaRaportti);

    // 3. Lähetetään kaikki data näkymälle
    res.render('urakkasopimukset/tarjous', {
      title: `Urakkatarjous #${id}`,
      urakka: urakkaRaportti,
      laskelmat
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Virhe haettaessa urakkatarjousta.");
  }
};

// Hyväksy urakkatarjous
export const hyvaksyUrakka = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const urakkaRaportti = await urakkasopimusModel.getUrakkaRaportti(id);

        if (!urakkaRaportti) {
            return res.status(404).send('Urakkaa ei löydy');
        }

        if (urakkaRaportti.hyvaksytty) {
            return res.status(400).send('Urakka on jo hyväksytty!');
        }

        const laskelmat = laskeKokonaisKustannus(urakkaRaportti);
        
        await urakkasopimusModel.hyvaksyJaLaskuta(
            id, 
            laskelmat.kokonaisKustannus,
            urakkaRaportti.asiakas_id,
            urakkaRaportti.tyokohde_id
        );

        res.redirect(`/urakkasopimukset/${id}/tarjous`);
    } catch (error) {
        console.error("Virhe urakkaa hyväksyessä:", error);
        res.status(500).send("Virhe hyväksynnässä.");
    }
};