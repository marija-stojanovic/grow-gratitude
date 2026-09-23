# Bašta i sadnja biljaka

Ekran `src/screens/GardenScreen.tsx` čita aktivne teme i sve biljke iz SQLite
baze. Svaka tema ima svoj sektor. U njemu se prikazuju aktivna biljka, trenutni
niz i svi završeni ciklusi. Dnevni suncokret se zaliva na ekranu Danas; njegova
slika i napredak se vide i u Bašti.

Dugme **Dodaj novu biljku** prikazuje samo obične teme bez aktivne biljke.
`src/services/plantingService.ts` ponovo provjerava temu i aktivnu biljku u
SQLite transakciji, nalazi najveći postojeći broj ciklusa i upisuje novi ciklus
sa stanjem `0/21`. Baza dodatno zabranjuje dvije aktivne biljke iste teme.
Automatski suncokret se ne može ručno zasaditi.

Aktivne biljke ostalih tema mogu se zalivati direktno u Bašti. Svaka ima svoje
polje zahvalnosti i svoj dnevni niz. Za čuvanje se koristi isti
`saveGratitudeAndWaterPlant` servis kao za suncokret, pa važe ista pravila
uzastopnosti, uvenuća i jednog zalivanja po biljci dnevno.

Na `21/21` obična biljka ostaje među završenim ciklusima. Aplikacija pita želi
li korisnik odmah započeti novu biljku iste teme. Odgovor **Ne sada** ostavlja
sektor bez aktivne biljke; novi ciklus se može zasaditi kasnije.

Posebne ilustracije za Porodicu, Zdravlje, Fakultet, Prijateljstvo, Ljubav i
Lični razvoj još nisu izrađene. Njihov prikaz je zato privremen i tekstualno
označen. Podaci i zalivanje tih biljaka već su stvarni.
