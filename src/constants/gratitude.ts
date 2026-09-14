import { BuiltInThemeKey } from '../types';

export interface BuiltInThemeDefinition {
  key: BuiltInThemeKey;
  name: string;
  description: string;
  plantTypeId: string;
  isAutomatic: boolean;
}

export const gratitudeThemes: BuiltInThemeDefinition[] = [
  {
    key: 'daily-gratitude',
    name: 'Dnevna biljka zahvalnosti',
    description: 'Male stvari koje uljepšaju dan.',
    plantTypeId: 'sunflower',
    isAutomatic: true,
  },
  {
    key: 'family',
    name: 'Porodica',
    description: 'Bliskost, podrška i zajednički trenuci.',
    plantTypeId: 'family-plant-pending',
    isAutomatic: false,
  },
  {
    key: 'health',
    name: 'Zdravlje',
    description: 'Briga o sebi i svom tijelu.',
    plantTypeId: 'health-plant-pending',
    isAutomatic: false,
  },
  {
    key: 'university',
    name: 'Fakultet',
    description: 'Nove lekcije i mali uspjesi.',
    plantTypeId: 'university-plant-pending',
    isAutomatic: false,
  },
  {
    key: 'friendship',
    name: 'Prijateljstvo',
    description: 'Ljudi s kojima dijeliš svakodnevicu.',
    plantTypeId: 'friendship-plant-pending',
    isAutomatic: false,
  },
  {
    key: 'love',
    name: 'Ljubav',
    description: 'Pažnja, nježnost i povezanost.',
    plantTypeId: 'love-plant-pending',
    isAutomatic: false,
  },
  {
    key: 'personal-growth',
    name: 'Lični razvoj',
    description: 'Koraci kojima rasteš i ti.',
    plantTypeId: 'personal-growth-plant-pending',
    isAutomatic: false,
  },
];
export const growthStages = [
  { days: '0', label: 'Sjeme' },
  { days: '1–4', label: 'Klica' },
  { days: '5–8', label: 'Mala biljka' },
  { days: '9–12', label: 'Srednja biljka' },
  { days: '13–16', label: 'Velika biljka' },
  { days: '17–20', label: 'Skoro odrasla' },
  { days: '21', label: 'Potpuno odrasla' },
];
