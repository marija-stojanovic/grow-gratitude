# Naziv, ikona i početni ekran

Android naziv aplikacije je `GrowGratitude` i definisan je u
`android/app/src/main/res/values/strings.xml`.

Novi vizuelni znak je nježno ilustrovan odrasli suncokret bez teksta. Izvorna
PNG datoteka sa prozirnom pozadinom čuva se u
`src/assets/branding/growgratitude-sunflower.png`. Skripta
`scripts/generate_android_branding.py` iz izvornog znaka generiše:

- klasične kvadratne launcher ikone za pet Android gustina;
- okrugle launcher ikone;
- foreground sloj adaptivne ikone;
- znak odgovarajuće veličine za početni ekran.

Pozadina ikone i početnog ekrana koristi pastelnu zelenu boju `#EBF1E5`.
Android 12 i noviji koriste sistemske splash-screen atribute u `values-v31`,
dok starije verzije koriste `launch_screen.xml` kao pozadinu prozora. Početni
ekran je namjerno jednostavan: pastelno zelena površina i suncokret u sredini,
bez dugog teksta koji bi se prikazivao samo tokom kratkog učitavanja.
