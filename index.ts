import express, { type Request, type Response } from 'express';
import path from 'path';

import asiakkaatRouter from './routes/asiakkaat';
import laskutRouter from './routes/laskut';
import tarvikkeetRouter from './routes/tarvikkeet';
import toimittajatRouter from './routes/toimittajat';
import tyokohteetRouter from './routes/tyokohteet';
import tyosopimuksetRouter from './routes/tyosopimukset';

const app = express();
const port = 8010;

// process.cwd() viittaa projektin juurikansioon (missä package.json on)
const rootDir = process.cwd();

// 1. EJS ja näkymät
app.set('view engine', 'ejs');
app.set('views', path.join(rootDir, 'views'));

// 2. Staattiset tiedostot
app.use(express.static(path.join(rootDir, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 3. Reitit
app.get('/', (req: Request, res: Response) => {
    res.render('index', { title: 'Etusivu' });
});

app.use('/asiakkaat', asiakkaatRouter);
app.use('/laskut', laskutRouter);
app.use('/tarvikkeet', tarvikkeetRouter);
app.use('/toimittajat', toimittajatRouter);
app.use('/tyokohteet', tyokohteetRouter);
app.use('/tyosopimukset', tyosopimuksetRouter);

app.listen(port, () => {
    console.log(`Palvelin pyärii osoitteessa: http://localhost:${port}`);
});