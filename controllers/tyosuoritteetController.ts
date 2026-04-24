import { type Request, type Response } from 'express';
import * as tyosuoriteModel from '../models/tyosuorite';
import * as TyosuoriteTunti from '../models/tyosuorite_tunti';
import * as TyosuoriteTarvike from '../models/tyosuorite_tarvike';
import * as Tarvike from '../models/tarvike';

export const listTyosuoritteet = async (req: Request, res: Response) => {
  try {
    const tyosuoritteet = await tyosuoriteModel.getAll();
    res.render('tyosuoritteet/tyosuoritteet', {
      title: 'Työsuoritteet',
      tyosuoritteet: tyosuoritteet
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Virhe haettaessa työsuoritteita.");
  }
};

export const getTyosuoriteDetail = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const tyosuorite = await tyosuoriteModel.getById(id);

    if (!tyosuorite) {
      return res.status(404).send('Työsuoritetta ei löydy');
    }

    const tunnit = await TyosuoriteTunti.getByTyosuoriteId(id);
    const kaytetytTarvikkeet = await TyosuoriteTarvike.getByTyosuoriteId(id);
    const kaikkiTarvikkeet = await Tarvike.getAll();

    res.render('tyosuoritteet/tyosuorite', {
      title: `TyÃ¶suorite #${id}`,
      tyosuorite: tyosuorite,
      tunnit: tunnit,
      kaytetytTarvikkeet: kaytetytTarvikkeet,
      kaikkiTarvikkeet: kaikkiTarvikkeet
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Virhe haettaessa työsuoritetta.");
  }
};

export const createKirjaus = async (req: Request, res: Response) => {
    try {
        const tyosuorite_id = parseInt(req.params.id as string, 10);
        const { kirjaustyyppi, tyyppi, maara, tarvike_id, alennus_prosentti } = req.body;

        if (!kirjaustyyppi || !maara) {
            return res.status(400).send("Kirjaustyyppi ja määrä ovat pakollisia kenttiä.");
        }

        const parsedMaara = parseFloat(maara as string);
        const parsedAlennus = alennus_prosentti ? parseFloat(alennus_prosentti as string) : 0;

        if (kirjaustyyppi === 'tunti') {
            await TyosuoriteTunti.add({
                tyosuorite_id: tyosuorite_id,
                tyyppi: tyyppi as string,
                maara: parsedMaara,
                alennus_prosentti: parsedAlennus
            });
        } else if (kirjaustyyppi === 'tarvike') {
            const parsedTarvikeId = parseInt(tarvike_id as string, 10);
            
            await TyosuoriteTarvike.add({
                tyosuorite_id: tyosuorite_id,
                tarvike_id: parsedTarvikeId,
                maara: parsedMaara,
                alennus_prosentti: parsedAlennus
            });
            
            await Tarvike.decreaseStock(parsedTarvikeId, parsedMaara);
        } else {
            return res.status(400).send("Tuntematon kirjaustyyppi.");
        }

        res.redirect(`/tyosuoritteet/${tyosuorite_id}`);
    } catch (err) {
        console.error("Virhe kirjauksessa:", err);
        res.status(500).send("Tietokantavirhe");
    }
};
