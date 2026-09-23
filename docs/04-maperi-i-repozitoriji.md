# Maperi SQLite redova i repozitoriji

## Zašto postoje maperi

SQLite kolone koriste nazive poput `theme_id`, `current_streak` i
`is_automatic`. Ostatak aplikacije koristi TypeScript nazive `themeId`,
`currentStreak` i `isAutomatic`. Datoteka `src/database/rowMappers.ts` opisuje
oblik svakog reda iz baze i pretvara ga u odgovarajući tip iz `src/types`.

SQLite čuva logičke vrijednosti kao `0` i `1`. Maperi ih pretvaraju u
TypeScript vrijednosti `false` i `true`. Time ekrani ne moraju poznavati način
na koji SQLite čuva podatke.

## Zajednički pristup bazi

`src/repositories/repositoryHelpers.ts` prije svakog upita čeka da se baza
inicijalizuje. Funkcija `firstRow` sigurno vraća prvi rezultat ili `null` kada
rezultat ne postoji.

## Repozitoriji

- `themeRepository` čita sve ili aktivne teme, pronalazi temu, dodaje novu i
  uključuje ili isključuje temu.
- `plantRepository` čita biljke i aktivnu biljku teme, pronalazi automatski
  suncokret, dodaje i preimenuje biljku, čuva stanje rasta i trajno briše
  biljku. SQLite zatim automatski briše njene zahvalnosti.
- `gratitudeRepository` čita istoriju, traži unose po biljci ili datumu,
  provjerava postoji li današnji unos i dodaje novu zahvalnost. Nema izmjenu ni
  pojedinačno brisanje jer je zahvalnost nepromjenjiv zapis.
- `moodRepository` čita raspoloženja i čuva današnji unos. `ON CONFLICT` za isti
  datum izmijeni postojeći red umjesto stvaranja duplikata.
- `challengeRepository` upravlja ugrađenim i korisničkim izazovima i bilježi
  izvršene izazove. SQL uslovi dozvoljavaju izmjenu i brisanje samo korisničkih
  izazova. Posljednji aktivni izazov ne može se isključiti.
- `settingsRepository` čita i čuva jedini red postavki, čiji je ID uvijek `1`.

`src/repositories/index.ts` predstavlja zajedničku ulaznu tačku, pa budući
ekrani mogu uvoziti repozitorije iz jednog direktorija.

## Granica ovog koraka

Repozitoriji izvršavaju pojedinačne operacije. Servis
`src/services/wateringService.ts` povezuje unos zahvalnosti i zalivanje biljke u
jednu transakciju. Ako INSERT zahvalnosti ili UPDATE biljke ne uspije, SQLite
poništava cijelu transakciju.

Servis provjerava tekst i datum, ponovo čita trenutno stanje biljke unutar
transakcije i primjenjuje pravila iz `decideWatering`. Vraća ažuriranu biljku i
informacije da li je niz ponovo pokrenut i da li je biljka upravo završena.

Kada automatski suncokret dostigne `21/21`, isti servis označava taj ciklus kao
završen i unutar iste transakcije pravi naredni suncokret sa sljedećim brojem
ciklusa i napretkom `0/21`. Rezultat u polju `plant` sadrži završeni suncokret,
a `nextPlant` sadrži novi aktivni suncokret. Kod običnih biljaka `nextPlant` je
`null`, jer korisnik prvo treba potvrditi da želi naredni ciklus.

## Trajno brisanje biljke

`src/services/plantDeletionService.ts` predstavlja jedinu operaciju koju ekran
treba koristiti za trajno brisanje biljke. Servis zahtijeva vrijednost
`confirmed: true`, provjerava da biljka postoji i bilježi koliko je zahvalnosti
vezano za nju.

Nakon naredbe `DELETE FROM plants`, strani ključ `ON DELETE CASCADE` automatski
briše sve redove iz `gratitude_entries` koji pripadaju toj biljci. Čitanje,
brojanje i brisanje izvršavaju se unutar jedne transakcije. Servis vraća
obrisanu biljku i broj obrisanih zahvalnosti kako bi ekran mogao prikazati
tačnu potvrdu korisniku.

## Ekran Danas

`src/screens/TodayScreen.tsx` pri otvaranju čita aktivni automatski suncokret
preko `plantRepository.findAutomaticActive()`. Funkcija `plantViewState`
izračunava današnji napredak, fazu i mogućnost zalivanja, pa ekran prikazuje
stvarni broj ciklusa, niz i naziv faze iz baze.

Polje zahvalnosti prima najviše 300 znakova. Dugme za zalivanje ostaje
onemogućeno kada je polje prazno, dok traje čuvanje ili kada je biljka već
zalivena tog dana. Nakon uspješnog poziva `saveGratitudeAndWaterPlant`, ekran
odmah prikazuje ažuriranu biljku. Ako je završeno `21/21`, prikazuje se novi
automatski ciklus koji je servis napravio.

`src/components/SunflowerIllustration.tsx` bira ilustraciju iz
`src/assets/plants/sunflower` prema fazi rasta. Ako je dan preskočen,
`plantViewState` vraća `witheredFromStage`, izračunat iz posljednjeg sačuvanog
niza, pa se prikazuje odgovarajuća uvenula klica, mala, srednja, velika ili
skoro odrasla biljka. Nije potrebna nova kolona u bazi: prethodni
`currentStreak` ostaje sačuvan dok naredno zalivanje ne započne niz od 1/21.

Nakon 21. zalivanja ekran prvo prikazuje potpuno odraslu biljku i čestitku.
Dugme „Prikaži novi ciklus“ zatim prikazuje sjeme novog automatskog ciklusa,
koji je već sačuvan u istoj transakciji.

Ilustracija koristi ugrađeni React Native `Animated`: tokom čuvanja zahvalnosti
kapljica pada prema biljci, a poslije promjene faze slika se blago pojavi i
uveća. Isti prelaz koristi se pri uvenuću, oporavku, prikazu odraslog
suncokreta i prelasku na novi ciklus. Animacija ne mijenja podatke u bazi.

Svih 13 PNG ilustracija suncokreta umanjeno je sa 1024 × 1536 na 512 × 768
piksela uz kvalitetno interpoliranje i očuvanu prozirnost. Ukupna veličina
datoteka smanjena je sa 26 209 019 na 4 996 498 bajtova. Nazivi i putanje
ostali su isti, pa nije potrebna izmjena `require` poziva u komponenti.
