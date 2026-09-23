# Istorija

Ekran `src/screens/HistoryScreen.tsx` učitava zahvalnosti, raspoloženja,
završene biljne cikluse i izvršene Spin Wheel izazove iz lokalne SQLite baze.
Na vrhu prikazuje sažetak sa brojem zapisa u svakoj kategoriji.

Zahvalnost prikazuje datum, tekst, temu, biljku, ciklus i dan niza.
Raspoloženje prikazuje sačuvani nivo i datum. Završena biljka prikazuje temu,
broj ciklusa, datum završetka i rezultat `21/21`. Izvršeni izazov prikazuje
naziv i datum izvršenja.

`historyService.ts` paralelno učitava podatke iz repozitorija i izdvaja samo
završene biljke, poređane od najnovije. Ekran povezuje tehničke identifikatore
sa nazivima tema, biljaka i izazova.

Svaka kategorija ima posebno prazno stanje. Dugme **Osvježi istoriju** ponovo
čita podatke iz baze bez ponovnog pokretanja aplikacije.
