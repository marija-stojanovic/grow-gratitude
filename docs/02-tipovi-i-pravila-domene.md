# Korak 2: TypeScript tipovi i pravila domene

Ovaj korak definiše podatke i pravila aplikacije bez baze. Ne mijenja ekrane i još ništa ne čuva na telefonu.

## Organizacija

`src/types` opisuje oblik podataka. `src/domain` sadrži čiste funkcije koje iz ulaznih podataka izračunavaju rezultat. Ekrani i buduća baza trebaju koristiti ista pravila iz `src/domain`, kako se ponašanje ne bi razlikovalo na različitim mjestima.

## Tipovi

- `common.ts`: identifikatori, lokalni datum `YYYY-MM-DD` i ISO vrijeme.
- `theme.ts`: sektor bašte. Ugrađena tema ima stabilan ključ; podržan je i budući tip vlastite teme.
- `plant.ts`: jedna biljka je jedan ciklus unutar teme. Čuva broj ciklusa, aktivni niz, ukupan broj zalivanja i životno stanje.
- `gratitude.ts`: nepromjenjiva zahvalnost povezana s biljkom i temom. `streakDay` bilježi koji je dan tadašnjeg niza ostvaren.
- `mood.ts`: vrijednost 1–5, datum i opciona bilješka. Jedinstvenost jednog zapisa dnevno kasnije osigurava baza.
- `challenge.ts`: ugrađeni ili korisnički izazov, aktivnost i zaseban zapis izvršenja.
- `settings.ts`: tema, notifikacije, vrijeme 20:00, onboarding, posljednji izazov i srpski jezik na latinici i ijekavici.
- `index.ts`: jedno mjesto iz kojeg ostatak aplikacije može uvoziti tipove.

Tema i biljka nisu isto. Tema je trajni sektor, npr. Zdravlje. U njemu ostaju sve završene biljke. Svaka pojedinačna biljka predstavlja jedan pokušaj završetka ciklusa. Može postojati najviše jedna nezavršena biljka po temi.

## Pravila

- `dateRules.ts` provjerava format datuma i računa razliku kalendarskih dana preko kraja mjeseca ili godine. Računanje koristi UTC samo kao matematičku osnovu, pa promjena ljetnog računanja vremena ne pretvara dan u 23 ili 25 sati.
- `plantRules.ts` mapira 0–21 zalivanje na dogovorene faze. `plantViewState` prikazuje uvenulo stanje kada je propušten najmanje jedan cijeli dan. `decideWatering` odbija dupli datum, datum unazad i završenu biljku; nastavlja niz narednog dana ili ga vraća na 1 poslije propuštenog dana. Na 21. dan automatski suncokret traži automatski naredni ciklus, a druga biljka traži ponudu korisniku.
- `gardenRules.ts` provjerava postoji li već aktivna biljka u sektoru, računa sljedeći broj ciklusa i kreira prazan naredni ciklus. Plan brisanja zahtijeva potvrdu i nalaže brisanje svih povezanih zahvalnosti.
- `challengeRules.ts` dozvoljava uređivanje i brisanje samo korisničkih izazova i sprečava isključivanje posljednjeg aktivnog izazova.
- `moodRules.ts` predlaže Spin Wheel za vrijednosti 1 i 2.
- `validation.ts` uklanja vanjske razmake i provjerava obavezna polja. Granice su 300 znakova za zahvalnost, 50 za naziv biljke i 100 za izazov.
- `defaults.ts` postavlja sistemsku temu, isključene notifikacije, vrijeme 20:00 i nezavršen onboarding.

Dogovorena poruka napretka generiše se iz podataka, npr. `Čestitamo! Vaš 2. ciklus je u toku.` i `7/21 uzastopnih dana`.

## Ugrađene teme

`src/constants/gratitude.ts` sada svakoj temi daje stabilan ključ, vrstu biljke i oznaku automatskog ponašanja. Dnevna biljka koristi `sunflower` i automatska je. Vrste ostalih biljaka imaju privremene identifikatore sa nastavkom `pending`, jer njihove ilustracije još nisu izabrane.

## Testovi

`__tests__/plantRules.test.ts` opisuje granice svih faza, nastavak niza, dupli unos, venuće, završetak automatskog i običnog ciklusa te poruke napretka.

`__tests__/domainRules.test.ts` opisuje prijelaz godine, validaciju teksta, prijedlog Spin Wheela, najmanje jedan aktivan izazov, naredni ciklus i trajno brisanje biljke sa zahvalnostima.

Testovi su napisani, ali nisu pokrenuti u ovom koraku prema zahtjevu korisnice.

## Važna ograničenja

Tip `LocalDate` dokumentuje format, a funkcija `isLocalDate` provjerava stvarnu vrijednost. Baza će kasnije dodati UNIQUE ograničenja za jedan unos po biljci i danu, jedno raspoloženje dnevno i jednu aktivnu biljku po temi.

Lokalna aplikacija može otkriti vraćanje datuma unazad kada zapamti posljednji prihvaćeni datum. Bez servera ili drugog pouzdanog izvora vremena ne može potpuno dokazati da je korisnik ručno pomjerao sat unaprijed. To ograničenje treba uzeti u obzir pri izradi baze.

## Provjera koju korisnica pokreće

```powershell
cd "C:\Users\Korisnik\Desktop\GrowGratitude"
npx.cmd --no-install tsc --noEmit
npm.cmd run lint
npm.cmd test -- --runInBand
```

Prva komanda provjerava TypeScript, druga stil koda, a treća pravila kroz Jest testove. Ove provjere ne zahtijevaju emulator i ne pokreću Android aplikaciju.
