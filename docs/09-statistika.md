# Statistika

Ekran `src/screens/StatisticsScreen.tsx` prikazuje sedmodnevni grafikon
raspoloženja, kalendarski pregled tekućeg mjeseca, prosjek i broj evidentiranih
dana. Korisnik bira između perioda **Posljednjih 7 dana** i **Tekući mjesec**.

Dani bez unosa ostaju prazni i ne ulaze u prosjek. Mjesečni pregled ne
pretpostavlja vrijednosti za buduće dane. Pored raspoloženja prikazuju se ukupan
broj zahvalnosti, broj biljaka koje su završile ciklus od 21 dana, broj
izvršenih Spin Wheel izazova i najduži ostvareni niz zahvalnosti.

`statisticsService.ts` sadrži izračunavanja nezavisna od korisničkog interfejsa.
Servis pravi kalendarske periode prema lokalnom datumu uređaja, računa prosjek
samo iz evidentiranih vrijednosti i čita potrebne podatke iz SQLite
repozitorija. Najduži niz je najveći sačuvani `streakDay`, pa raniji rekord
ostaje vidljiv i nakon prekida niza. Izvršeni izazovi broje se prema jedinstvenoj
kombinaciji izazova i datuma.

Grafikoni su napravljeni standardnim React Native komponentama, bez dodatne
biblioteke. Sedmodnevni pregled koristi stubce, a mjesečni pregled mrežu
kalendarskih dana.
