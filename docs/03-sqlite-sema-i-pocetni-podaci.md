# Korak 3: SQLite šema i početni podaci

## Tok pokretanja

`App.tsx` poziva `initializeDatabase()` → `connection.ts` otvara `growgratitude.db` i uključuje strane ključeve i WAL → `migrations.ts` čita `PRAGMA user_version` → za novu bazu pokreće migraciju verzije 1 → `schema.ts` kreira tabele i indekse → `seed.ts` daje početne podatke.

Inicijalizacija koristi jednu Promise vrijednost. Ako je dvije komponente zatraže istovremeno, obje čekaju isti proces umjesto da paralelno pokrenu dvije migracije. Ako inicijalizacija ne uspije, vrijednost se resetuje kako bi naredni pokušaj bio moguć.

## Tabele

| Tabela | Svrha | Najvažnija ograničenja |
| --- | --- | --- |
| `themes` | Trajni sektori bašte | Jedinstven ugrađeni ključ, provjera porijekla i boolean vrijednosti. |
| `plants` | Jedna biljka/jedan ciklus | Veza s temom, jedinstven broj ciklusa u temi, niz 0–21. |
| `gratitude_entries` | Nepromjenjive zahvalnosti | Veza s biljkom i temom, tekst 1–300, jedan zapis po biljci i datumu. |
| `mood_entries` | Jedno dnevno raspoloženje | Vrijednost 1–5 i jedinstven datum. |
| `challenges` | Ugrađeni i korisnički izazovi | Naslov 1–100, naslov jedinstven bez obzira na velika/mala slova. |
| `challenge_completions` | Evidencija završenih izazova | Jedan isti izazov najviše jednom po datumu. |
| `app_settings` | Jedan red postavki | Dozvoljen samo red `id = 1`, provjera teme, vremena i boolean vrijednosti. |

## Ograničenja iz pravila aplikacije

`UNIQUE (plant_id, entry_date)` garantuje jednu zahvalnost po biljci dnevno čak i ako korisnik brzo pritisne dugme više puta.

`entry_date TEXT NOT NULL UNIQUE` u `mood_entries` garantuje jedno raspoloženje dnevno. Današnji izbor će se kasnije mijenjati ažuriranjem tog reda.

Parcijalni jedinstveni indeks `one_active_plant_per_theme` dozvoljava samo jednu biljku statusa `growing` ili `withered` po temi. Završene biljke nisu dio indeksa, pa ih u sektoru može biti neograničeno mnogo.

`gratitude_entries.plant_id` koristi `ON DELETE CASCADE`. Kada se biljka trajno obriše, SQLite automatski briše sve zahvalnosti vezane za nju. Brisanje ćemo u repozitoriju izvršavati u transakciji i tek nakon korisničke potvrde.

Strani ključevi se uključuju pri svakom otvaranju veze naredbom `PRAGMA foreign_keys = ON`. WAL režim se uključuje sa `PRAGMA journal_mode = WAL`.

Indeksi za datume i teme ubrzavaju buduću Historiju, Statistiku i prikaz sektora bez učitavanja cijele baze.

## Početni podaci

Nova baza dobija sedam ugrađenih tema. Dnevna zahvalnost koristi suncokret i automatsko ponašanje. Ostale vrste biljaka nose privremene `pending` identifikatore dok ne definišemo grafiku.

Kreira se `Dnevni suncokret`, ciklus 1, status `growing`, napredak 0/21. Ostale biljke se ne kreiraju automatski.

Dodaje se deset početnih izazova, svi uključeni. Dodaje se jedan red postavki: sistemska tema, isključene notifikacije, vrijeme 20:00, nezavršen onboarding i srpski jezik na latinici i ijekavici.

Početni zapisi koriste stabilne identifikatore i `INSERT OR IGNORE`. Ponovno pokretanje migracije ih zato ne duplira. Novi početni podaci u budućnosti zahtijevat će novu verziju migracije.

## Verzije i transakcija

SQLite `PRAGMA user_version` je trenutno 1. Ako je baza prazna, izvršava se migracija 1. Ako aplikacija jednog dana otvori bazu novije verzije nego što kod razumije, inicijalizacija se prekida umjesto da ošteti podatke.

Kreiranje šeme, početnih zapisa i postavljanje verzije izvršavaju se u jednoj transakciji. Greška poništava cijeli postupak.

## Datoteke

- `src/database/connection.ts`: jedna veza, konfiguracija i pokretanje migracija.
- `src/database/schema.ts`: SQL tabele, indeksi i CHECK/UNIQUE/FOREIGN KEY pravila.
- `src/database/migrations.ts`: čitanje verzije, transakcija i migracija 0 → 1.
- `src/database/seed.ts`: početne teme, suncokret, izazovi i postavke.
- `__tests__/databaseSeed.test.ts`: provjera broja i ključnih vrijednosti početnih podataka.

## Provjera koju korisnica pokreće

Ove komande ne zahtijevaju emulator:

```powershell
cd "C:\Users\Korisnik\Desktop\GrowGratitude"
npx.cmd --no-install tsc --noEmit
npm.cmd run lint
npm.cmd test -- --runInBand
```

Za stvarno kreiranje baze potreban je novi Android build zbog native SQLite biblioteke, pokrenut emulator i Metro. Nakon uspješnog otvaranja aplikacije datoteke se mogu provjeriti sa:

```powershell
adb shell run-as com.growgratitude ls -R files
```

Očekuje se `growgratitude.db`, a uz WAL mogu postojati i nastavci `-wal` i `-shm`.
