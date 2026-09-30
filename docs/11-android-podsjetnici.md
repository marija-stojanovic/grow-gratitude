# Android dnevni podsjetnici

## Implementacija

Za lokalna Android obavještenja koristi se `@notifee/react-native`. Biblioteka
je povezana automatskim React Native autolinking postupkom i zbog native koda
zahtijeva novi Android build nakon instalacije.

`src/services/notificationService.ts`:

- pravi kanal `GrowGratitude podsjetnici`;
- računa prvi naredni termin iz sačuvanog vremena;
- zakazuje podsjetnik koji se ponavlja svakog dana;
- koristi stabilan ID kako promjena vremena ne bi napravila duplikat;
- otkazuje podsjetnik kada se postavka isključi;
- otvara Android postavke kada korisnik naknadno želi dozvoliti obavještenja.

`src/theme/ThemeProvider.tsx` usklađuje stvarni raspored sa SQLite postavkama
pri pokretanju aplikacije i pri svakoj promjeni prekidača ili vremena.

Android manifest sadrži dozvolu `POST_NOTIFICATIONS`. Na Androidu 13 i novijim
korisnik dobija sistemsko pitanje kada prvi put uključi podsjetnik. Ako odbije,
postavka se ne uključuje i ekran prikazuje objašnjenje i prečicu do Android
postavki obavještenja.

## Sadržaj obavještenja

Naslov je `Vrijeme je za zahvalnost 🌻`, a poruka poziva korisnika da zalije
suncokret jednom lijepom mišlju iz tog dana. Dodir na obavještenje otvara
aplikaciju.

## Tačnost termina

Podsjetnik koristi Androidov uobičajeni vremenski okidač. Sistem može neznatno
odložiti isporuku zbog štednje baterije. Aplikacija zbog toga ne traži posebnu
dozvolu za tačne alarme, koja je namijenjena alarmima i kalendarima.
