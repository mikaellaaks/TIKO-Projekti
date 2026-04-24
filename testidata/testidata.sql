/* ASIAKAS */
INSERT INTO asiakas (asiakas_id, nimi, osoite) VALUES (1, 'Hosunen, Jaska', 'Susimetsä');
INSERT INTO asiakas (asiakas_id, nimi, osoite) VALUES (2, 'Jokinen, Lissu', 'Nurmitie');
INSERT INTO asiakas (asiakas_id, nimi, osoite) VALUES (3, 'Näsänen, Masa', 'Masalantie');

/* TYOKOHDE */
INSERT INTO tyokohde (tyokohde_id, nimi, osoite, asiakas_id) VALUES (1, 'Kohde Susimetsä', 'Susimetsä', 1);
INSERT INTO tyokohde (tyokohde_id, nimi, osoite, asiakas_id) VALUES (2, 'Kohde Nurmitie', 'Nurmitie', 2);
INSERT INTO tyokohde (tyokohde_id, nimi, osoite, asiakas_id) VALUES (3, 'Kohde Puotonkorpi', 'Puotonkorpi', 3);
INSERT INTO tyokohde (tyokohde_id, nimi, osoite, asiakas_id) VALUES (4, 'Kohde Huitsinneva', 'Huitsinneva', 2);
INSERT INTO tyokohde (tyokohde_id, nimi, osoite, asiakas_id) VALUES (5, 'Kohde Masalantie', 'Masalantie', 3);

/* TOIMITTAJA */
INSERT INTO toimittaja (toimittaja_id, nimi) VALUES (1, 'How-data');
INSERT INTO toimittaja (toimittaja_id, nimi) VALUES (2, 'Moponet');
INSERT INTO toimittaja (toimittaja_id, nimi) VALUES (3, 'Junk Co');
INSERT INTO toimittaja (toimittaja_id, nimi) VALUES (4, 'Mopenet');

/* TARVIKE */
INSERT INTO tarvike (tarvike_id, nimi, sisaanostohinta, myyntihinta, alv, yksikko, toimittaja_id, saldo) VALUES (1, 'USB-kaapeli', 4, 5, 24, 'kpl', 1, 100);
INSERT INTO tarvike (tarvike_id, nimi, sisaanostohinta, myyntihinta, alv, yksikko, toimittaja_id, saldo) VALUES (2, 'sahkojohto', 1, 1.25, 24, 'metri', 2, 100);
INSERT INTO tarvike (tarvike_id, nimi, sisaanostohinta, myyntihinta, alv, yksikko, toimittaja_id, saldo) VALUES (3, 'maakaapeli', 4, 5, 24, 'metri', 2, 100);
INSERT INTO tarvike (tarvike_id, nimi, sisaanostohinta, myyntihinta, alv, yksikko, toimittaja_id, saldo) VALUES (4, 'palohälytin', 4, 5, 24, 'kpl', 3, 100);
INSERT INTO tarvike (tarvike_id, nimi, sisaanostohinta, myyntihinta, alv, yksikko, toimittaja_id, saldo) VALUES (5, 'sähköjohto', 1, 1.25, 24, 'metri', 4, 100);

/* LASKU */
INSERT INTO lasku (lasku_id, laskunro, paivamaara, erapaiva, kokonaissumma) VALUES (1, 1, '2025-10-01', '2025-10-15', 130.2);
INSERT INTO lasku (lasku_id, laskunro, paivamaara, erapaiva, kokonaissumma) VALUES (2, 2, '2025-10-25', '2025-11-10', 130.2);
INSERT INTO lasku (lasku_id, laskunro, paivamaara, erapaiva, kokonaissumma) VALUES (3, 3, '2025-11-27', '2025-12-13', 130.2);
INSERT INTO lasku (lasku_id, laskunro, paivamaara, erapaiva, kokonaissumma) VALUES (4, 4, '2026-02-01', '2026-02-15', 716.0640000000001);
INSERT INTO lasku (lasku_id, laskunro, paivamaara, erapaiva, kokonaissumma) VALUES (5, 5, '2026-02-01', '2026-02-15', 2488.18028);
INSERT INTO lasku (lasku_id, laskunro, paivamaara, erapaiva, kokonaissumma) VALUES (6, 6, '2026-02-15', '2026-03-01', 2488.18028);
INSERT INTO lasku (lasku_id, laskunro, paivamaara, erapaiva, kokonaissumma) VALUES (7, 7, '2026-03-05', '2026-03-20', 2488.18028);
INSERT INTO lasku (lasku_id, laskunro, paivamaara, erapaiva, kokonaissumma) VALUES (8, 8, '2026-03-01', '2026-03-15', 74.4);
INSERT INTO lasku (lasku_id, laskunro, paivamaara, erapaiva, kokonaissumma) VALUES (9, 9, '2026-03-01', '2026-03-15', 725.1271999999999);

/* TYOSUORITTEET */
INSERT INTO tyosuorite (tyosuorite_id, asiakas_id, tyokohde_id, lasku_id, tyyppi) VALUES (1, 1, 1, 1, 'urakka');
INSERT INTO tyosuorite_tarvike (suorite_tarvike_id, tyosuorite_id, tarvike_id, maara, alennus_prosentti) VALUES (1, 1, 1, 1, 0);
INSERT INTO tyosuorite (tyosuorite_id, asiakas_id, tyokohde_id, lasku_id, tyyppi) VALUES (2, 1, 1, 2, 'urakka');
INSERT INTO tyosuorite_tarvike (suorite_tarvike_id, tyosuorite_id, tarvike_id, maara, alennus_prosentti) VALUES (2, 2, 1, 1, 0);
INSERT INTO tyosuorite (tyosuorite_id, asiakas_id, tyokohde_id, lasku_id, tyyppi) VALUES (3, 1, 1, 3, 'urakka');
INSERT INTO tyosuorite_tarvike (suorite_tarvike_id, tyosuorite_id, tarvike_id, maara, alennus_prosentti) VALUES (3, 3, 1, 1, 0);
INSERT INTO tyosuorite (tyosuorite_id, asiakas_id, tyokohde_id, lasku_id, tyyppi) VALUES (4, 2, 2, 4, 'tunti');
INSERT INTO tyosuorite_tunti (tunti_id, tyosuorite_id, tyyppi, maara, alennus_prosentti) VALUES (1, 4, 'suunnittelu', 3, 10);
INSERT INTO tyosuorite_tunti (tunti_id, tyosuorite_id, tyyppi, maara, alennus_prosentti) VALUES (2, 4, 'työ', 12, 0);
INSERT INTO tyosuorite_tarvike (suorite_tarvike_id, tyosuorite_id, tarvike_id, maara, alennus_prosentti) VALUES (4, 4, 2, 3, 10);
INSERT INTO tyosuorite (tyosuorite_id, asiakas_id, tyokohde_id, lasku_id, tyyppi) VALUES (5, 3, 3, 5, 'tunti');
INSERT INTO tyosuorite_tunti (tunti_id, tyosuorite_id, tyyppi, maara, alennus_prosentti) VALUES (3, 5, 'suunnittelu', 25, 20);
INSERT INTO tyosuorite_tunti (tunti_id, tyosuorite_id, tyyppi, maara, alennus_prosentti) VALUES (4, 5, 'työ', 7, 10);
INSERT INTO tyosuorite_tunti (tunti_id, tyosuorite_id, tyyppi, maara, alennus_prosentti) VALUES (5, 5, 'aputyö', 3, 0);
INSERT INTO tyosuorite_tarvike (suorite_tarvike_id, tyosuorite_id, tarvike_id, maara, alennus_prosentti) VALUES (5, 5, 3, 100, 10);
INSERT INTO tyosuorite (tyosuorite_id, asiakas_id, tyokohde_id, lasku_id, tyyppi) VALUES (6, 3, 3, 6, 'tunti');
INSERT INTO tyosuorite_tunti (tunti_id, tyosuorite_id, tyyppi, maara, alennus_prosentti) VALUES (6, 6, 'suunnittelu', 25, 20);
INSERT INTO tyosuorite_tunti (tunti_id, tyosuorite_id, tyyppi, maara, alennus_prosentti) VALUES (7, 6, 'työ', 7, 10);
INSERT INTO tyosuorite_tunti (tunti_id, tyosuorite_id, tyyppi, maara, alennus_prosentti) VALUES (8, 6, 'aputyö', 3, 0);
INSERT INTO tyosuorite_tarvike (suorite_tarvike_id, tyosuorite_id, tarvike_id, maara, alennus_prosentti) VALUES (6, 6, 3, 100, 10);
INSERT INTO tyosuorite (tyosuorite_id, asiakas_id, tyokohde_id, lasku_id, tyyppi) VALUES (7, 3, 3, 7, 'tunti');
INSERT INTO tyosuorite_tunti (tunti_id, tyosuorite_id, tyyppi, maara, alennus_prosentti) VALUES (9, 7, 'suunnittelu', 25, 20);
INSERT INTO tyosuorite_tunti (tunti_id, tyosuorite_id, tyyppi, maara, alennus_prosentti) VALUES (10, 7, 'työ', 7, 10);
INSERT INTO tyosuorite_tunti (tunti_id, tyosuorite_id, tyyppi, maara, alennus_prosentti) VALUES (11, 7, 'aputyö', 3, 0);
INSERT INTO tyosuorite_tarvike (suorite_tarvike_id, tyosuorite_id, tarvike_id, maara, alennus_prosentti) VALUES (7, 7, 3, 100, 10);
INSERT INTO tyosuorite (tyosuorite_id, asiakas_id, tyokohde_id, lasku_id, tyyppi) VALUES (8, 2, 4, 8, 'urakka');
INSERT INTO tyosuorite_tarvike (suorite_tarvike_id, tyosuorite_id, tarvike_id, maara, alennus_prosentti) VALUES (8, 8, 4, 2, 0);
INSERT INTO tyosuorite (tyosuorite_id, asiakas_id, tyokohde_id, lasku_id, tyyppi) VALUES (9, 3, 5, 9, 'tunti');
INSERT INTO tyosuorite_tunti (tunti_id, tyosuorite_id, tyyppi, maara, alennus_prosentti) VALUES (12, 9, 'suunnittelu', 3, 0);
INSERT INTO tyosuorite_tunti (tunti_id, tyosuorite_id, tyyppi, maara, alennus_prosentti) VALUES (13, 9, 'työ', 12, 0);
INSERT INTO tyosuorite_tarvike (suorite_tarvike_id, tyosuorite_id, tarvike_id, maara, alennus_prosentti) VALUES (9, 9, 5, 3, 0);

/* RESET SEQUENCES */
SELECT setval('asiakas_asiakas_id_seq', (SELECT MAX(asiakas_id) FROM asiakas));
SELECT setval('tyokohde_tyokohde_id_seq', (SELECT MAX(tyokohde_id) FROM tyokohde));
SELECT setval('toimittaja_toimittaja_id_seq', (SELECT MAX(toimittaja_id) FROM toimittaja));
SELECT setval('tarvike_tarvike_id_seq', (SELECT MAX(tarvike_id) FROM tarvike));
SELECT setval('lasku_lasku_id_seq', (SELECT MAX(lasku_id) FROM lasku));
SELECT setval('tyosuorite_tyosuorite_id_seq', (SELECT MAX(tyosuorite_id) FROM tyosuorite));
SELECT setval('tyosuorite_tunti_tunti_id_seq', (SELECT MAX(tunti_id) FROM tyosuorite_tunti));
SELECT setval('tyosuorite_tarvike_suorite_tarvike_id_seq', (SELECT MAX(suorite_tarvike_id) FROM tyosuorite_tarvike));
