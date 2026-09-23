# Spin Wheel izazovi

Ekran `src/screens/SpinWheelScreen.tsx` učitava samo aktivne izazove iz lokalne
SQLite baze. Korisnik može otvoriti ekran kroz karticu **Izazovi** ili kroz
prijedlog koji se pojavljuje poslije sačuvanog lošeg ili veoma lošeg
raspoloženja. Prijedlog ne otvara ekran automatski.

Pritiskom na **Zavrti Spin Wheel** pokreće se kratka animacija, nakon koje
`selectRandomChallenge` bira jedan od aktivnih izazova. Izabrani izazov može se
označiti kao izvršen.

`completeChallenge` provjerava datum, postojanje izazova i da li je izazov još
aktivan. Prije upisa provjerava da li je isti izazov već izvršen tog dana.
SQLite tabela `challenge_completions` dodatno ima jedinstveno ograničenje nad
kombinacijom izazova i datuma.

Završetak se trajno čuva u tabeli `challenge_completions`, pa će kasnije moći
da se prikaže u istoriji i statistici.
