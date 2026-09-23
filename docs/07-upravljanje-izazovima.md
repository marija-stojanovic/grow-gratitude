# Upravljanje Spin Wheel izazovima

U odjeljku **Tvoji izazovi** na ekranu Postavke korisnik vidi ugrađene i svoje
izazove. Prekidač određuje da li izazov ulazi u nasumičan izbor Spin Wheela.
Najmanje jedan izazov uvijek mora ostati aktivan.

Ugrađeni izazovi mogu se uključiti i isključiti, ali se ne mogu preimenovati ni
brisati. Korisnički izazov se dodaje kao aktivan i može se kasnije urediti,
isključiti, ponovo uključiti ili trajno obrisati.

`challengeManagementService.ts` provjerava dozvoljene operacije, obavezan naziv,
maksimalnu dužinu od 100 znakova i duple nazive. Repozitorij izvršava SQLite
operacije, dok ograničenja baze pružaju dodatnu zaštitu od duplih zapisa.

Brisanje korisničkog izazova traži potvrdu. Zbog veze `ON DELETE CASCADE`, s
izazovom se brišu i njegova ranije evidentirana izvršenja.

Spin Wheel ponovo učitava aktivne izazove svaki put kada se otvori njegova
kartica, pa se promjene iz Postavki odmah koriste pri sljedećem otvaranju.
