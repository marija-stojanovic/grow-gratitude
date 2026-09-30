# Trajne postavke aplikacije

## Šta je implementirano

Postavke se pri pokretanju aplikacije učitavaju iz SQLite tabele
`app_settings`. Dok učitavanje traje, ekran Postavke prikazuje indikator. Ako
čitanje ili čuvanje ne uspije, korisnik vidi poruku i dugme za novi pokušaj.

Trajno se čuvaju:

- izbor sistemske, svijetle ili tamne teme;
- uključen ili isključen dnevni podsjetnik;
- vrijeme podsjetnika u formatu `HH:mm`, sa početnom vrijednošću `20:00`;
- jezik `sr-Latn-ijekavian`.

## Organizacija koda

- `src/repositories/settingsRepository.ts` čita i mijenja red postavki u
  SQLite bazi.
- `src/services/settingsService.ts` provjerava temu i vrijeme, spaja novu
  vrijednost sa postojećim postavkama i čuva kompletno stanje.
- `src/theme/ThemeProvider.tsx` učitava postavke pri pokretanju, primjenjuje
  izabranu temu na cijelu aplikaciju i izlaže stanje učitavanja, čuvanja i
  greške.
- `src/screens/SettingsScreen.tsx` daje korisniku kontrole za temu, podsjetnik
  i vrijeme, te prikazuje sačuvani jezik.
- `__tests__/settingsService.test.ts` provjerava učitavanje, izmjene i
  odbijanje neispravnog vremena.

Stvarno zakazivanje Android obavještenja opisano je u dokumentu
`11-android-podsjetnici.md`.
