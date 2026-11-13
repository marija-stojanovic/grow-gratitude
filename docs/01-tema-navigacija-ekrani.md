# Korak 1: Tema, navigacija i osnovni ekrani

## Šta je implementirano

Početni React Native demo zamijenjen je osnovom GrowGratitude aplikacije. Postoji pet kartica: Danas, Bašta, Istorija, Statistika i Postavke. U ovoj fazi ne postoje korisnički podaci, unos zahvalnosti, zalivanje niti baza. Poruke „u pripremi“ označavaju buduće funkcije i nisu dugmad.

### Kako su dijelovi povezani

App.tsx → SafeAreaProvider → ThemeProvider → AppNavigator → odabrani ekran → zajedničke UI komponente.

- `App.tsx` sastavlja aplikaciju. SafeAreaProvider daje podatke o prostoru koji zauzimaju sistemske trake i izrezi ekrana.
- `src/theme/tokens.ts` sadrži palete boja, razmake, veličine teksta i zaobljenja. Nazivi poput `surface` i `text` opisuju namjenu boje. To omogućava da isti ekran radi u obje teme.
- `src/theme/ThemeProvider.tsx` dijeli izabranu svijetlu ili tamnu paletu sa svim ekranima. `useTheme()` je način da komponenta pročita temu. Svijetla tema je početna, a izbor se trajno čuva u SQLite postavkama.
- `src/navigation/AppNavigator.tsx` čuva aktivnu karticu i prikazuje odgovarajući ekran. Ovo je jednostavna vlastita navigacija preko React stanja, bez nove biblioteke. Android Back vraća na Danas, a sa Danas prepušta povratak Android sistemu. Promjena kartice ponovo otvara njen ekran od vrha. Sadržaj forme i istorija detaljnih ruta još ne postoje. Pri dodavanju formi uvest ćemo navigaciju koja podržava njihove tokove i zaštitu nespremljenog teksta.
- Datum se osvježava jednom u minuti i pri povratku u aplikaciju. Timer i pretplate uklanjaju se kada se navigator ukloni.
- `src/components/UI.tsx` sadrži Screen, Copy, Card, Button, Badge i EmptyState. Time se zajednički stilovi ne kopiraju na svakom ekranu.
- `src/components/SeedIllustration.tsx` crta dekorativnu biljku pomoću React Native View oblika. Nije stvarna biljka korisnika niti kompletan skup faza rasta. Nema dodatnih slika ili biblioteka.
- `src/constants/gratitude.ts` sadrži sedam dogovorenih tema i tekstualnu tabelu faza 0, 1–4, 5–8, 9–12, 13–16, 17–20, 21. To trenutno služi prikazu pravila, ne računanju rasta.

### Ekrani

| Datoteka u src/screens | Sadržaj                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------- |
| TodayScreen.tsx        | Datum, uvodna ilustracija, dugme koje otvara Baštu, najave raspoloženja i izazova. |
| GardenScreen.tsx       | Prazna bašta, sedam tema i objašnjenje uzastopnog rasta.                           |
| HistoryScreen.tsx      | Prazno stanje i objašnjenje buduće istorije.                                       |
| StatisticsScreen.tsx   | Prazno stanje buduće statistike, bez izmišljenih rezultata.                        |
| SettingsScreen.tsx     | Funkcionalan izbor teme, najave podsjetnika i izazova, verzija iz package.json.    |

### Prilagođavanje i pristupačnost

Ekrani se mogu skrolovati, tekst nije ograničen na jedan red i koristi sistemsko povećanje fonta. Sadržaj ima maksimalnu širinu 760, pa je na tabletu centriran. Donja navigacija se može horizontalno skrolovati kada povećan font ili mala širina zahtijevaju više prostora. Tipke imaju najmanje 48 jedinica dodirne površine. Kartice imaju tekstualne nazive, odabrano stanje je označeno za čitač ekrana, a izbor teme koristi radio opcije. Dekorativna ilustracija je skrivena od čitača ekrana. Simboli navigacije su zasad tekstualni znakovi; njihov izgled može zavisiti od sistemskog fonta.

## Šta nije dio ove faze

Trajno čuvanje postavki, unos raspoloženja, baze, sadnja biljaka, različite ilustracije za svaku temu, animacije rasta, Spin Wheel, pretraga, grafikoni i notifikacije dolaze u narednim koracima. Trenutna navigacija nema duboke linkove niti otvaranje iz notifikacija.

Nisu dodane npm zavisnosti. Nisu mijenjane Java/Gradle postavke. Postojeći osnovni test dobio je unmount čišćenje kako bi uklonio timere i pretplate aplikacije. Provjere, build i emulator nisu pokretani tokom ovog koraka, prema zahtjevu korisnice. Ove promjene nisu commitovane niti poslane na GitHub.

## Kako sama provjeriti

U PowerShellu otvori projekat:

```powershell
cd "C:\Users\Korisnik\Desktop\GrowGratitude"
npx.cmd --no-install tsc --noEmit
npm.cmd run lint
```

Prva komanda provjerava tipove, druga pravila koda. Ako nema grešaka, obje završavaju bez izvještaja o problemima. Nisu dokaz da ekran vizuelno izgleda ispravno.

Ako Metro već radi i aplikacija je otvorena, izmjene se obično učitaju automatski. Za ponovno učitavanje pritisni `r` u Metro terminalu. Ne pokreći drugi Metro ako jedan već radi.

Ako ništa nije pokrenuto, pokreni Pixel 8 kroz Android Studio Device Manager. U prvom terminalu iz foldera projekta:

```powershell
npm.cmd start
```

U drugom terminalu:

```powershell
cd "C:\Users\Korisnik\Desktop\GrowGratitude"
npm.cmd run android
```

Provjeri:

1. Otvara se Danas, umjesto React Native demo ekrana.
2. Sve pet kartica otvara odgovarajući sadržaj.
3. Dugme Pogledaj baštu otvara Baštu i označi njenu karticu.
4. Android Back sa druge kartice vraća na Danas.
5. U Postavkama Svijetla i Tamna odmah mijenjaju sve ekrane.
6. Sa izabranom Sistemskom temom, promjena teme uređaja mijenja i aplikaciju.
7. Na Bašti su svih sedam tema i tačna tabela faza rasta.
8. Sadržaj se može skrolovati do kraja i u landscape orijentaciji.
9. Veći sistemski font ne skriva sadržaj; navigacija se po potrebi može pomjerati lijevo/desno.
10. Potpuni restart aplikacije vraća temu na Sistemsku; to je trenutno očekivano.

Ako se pojavi greška, pošalji njen kompletan tekst i naznači pri kojoj komandi ili radnji je nastala.

## Čuvanje nakon provjere

```powershell
git status
git diff
git add App.tsx src docs __tests__/App.test.tsx
git diff --cached --stat
git commit -m "Add theme, tab navigation and starter screens"
git push
```

Prije commita pregledaj da su uključene samo izmjene koje želiš sačuvati. Push šalje commit na već povezani GitHub repozitorij.
