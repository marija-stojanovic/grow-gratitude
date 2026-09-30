# Sektori bašte i detalji biljke

Ekran Bašta prikazuje sedam ugrađenih sektora: Dnevnu zahvalnost, Porodicu,
Zdravlje, Fakultet, Prijateljstvo, Ljubav i Lični razvoj. U svakom sektoru
prikazuju se aktivna ili uvenula biljka i svi ranije završeni ciklusi.

Tok `Dodaj novu biljku` prikazuje samo obične teme koje nemaju aktivnu biljku.
Korisnik bira sektor, vidi vrstu biljke, unosi naziv i pokreće novi ciklus. U
ovoj fazi sve teme koriste postojeće ilustracije suncokreta. Podatak
`plantTypeId` ostaje u modelu, pa se kasnije za svaku temu može povezati druga
vrsta biljke bez promjene osnovnog toka sadnje.

Pritiskom na bilo koju biljku otvara se prikaz detalja sa ilustracijom trenutne
faze, statusom, brojem ciklusa, nizom od 21 dana, datumom posljednjeg zalivanja
i svim zahvalnostima te biljke. Brisanje traži potvrdu i preko SQLite pravila
`ON DELETE CASCADE` uklanja i povezane zahvalnosti. Aktivni automatski
suncokret je zaštićen od brisanja kako ekran Danas ne bi ostao bez obavezne
dnevne biljke.

Kada obična biljka dođe do 21/21, korisnik dobija pitanje želi li odmah
započeti novu biljku iste teme. Novi ciklus zadržava naziv prethodne biljke,
dok korisnik kasnije može izabrati novi naziv kroz redovan tok sadnje.

## Komponentna struktura

Prikaz Bašte podijeljen je na manje komponente u `src/components/garden`:

- `GardenOverview` prikazuje sažetak i otvara tok sadnje;
- `PlantingForm` prikazuje izbor teme, vrstu i naziv nove biljke;
- `GardenSector` prikazuje jedan sektor i povezuje njegove biljke sa unosom;
- `PlantCard` prikazuje sažetak jednog ciklusa;
- `WaterPlantForm` obrađuje unos dnevne zahvalnosti;
- `PlantDetails` prikazuje sve informacije o izabranoj biljci;
- `PlantGratitudeList` prikazuje zahvalnosti povezane s biljkom.

`GardenScreen` upravlja stanjem, čitanjem iz baze i pozivima servisa, a podatke
i događaje prosljeđuje manjim komponentama kroz props.

## Testni sektor razvoja

U razvojnoj verziji Bašte prikazuje se `TestGardenSector`. On koristi iste
funkcije za određivanje faze i iste ilustracije kao prava biljka, ali svoje
stanje drži samo u memoriji. Dugmad omogućavaju dodavanje jednog dana, prelazak
na sljedeću fazu, simuliranje preskočenog dana i vraćanje na sjeme. Testni
sektor ne upisuje zahvalnosti u SQLite bazu i ne utiče na Istoriju ili
Statistiku. React Native konstanta `__DEV__` sprečava njegovo prikazivanje u
produkcijskoj verziji aplikacije.
