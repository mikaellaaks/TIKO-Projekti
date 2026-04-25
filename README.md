## Vaatimukset:

PostgreSQL ja NodeJS pitää olla asennettuna.

## Ohjelman alustus

Muokkaa .env.example tiedosto .env muotoon ja vaihda salasanan kohdalle oma master salasana.

Luo psql komentoriviä käyttämällä tietokanta:

```bash
CREATE DATABASE sahkotarsky;
```

Aja sitten seuraavat komennot:

```bash
# Hakee tarvittavat Node paketit
npm install

# Luo taulut valmiista schema.sql tiedostosta
npx ts-node init_db.ts

# Käynnistä palvelin
npm run dev

```

## Käyttöliittymä

Käyttöliittymään pääsee sitten käsiksi paikalliselta palvelimelta:

[http://localhost:8010](http://localhost:8010)
