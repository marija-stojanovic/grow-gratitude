import { gratitudeThemes } from '../constants/gratitude';
import { DEFAULT_APP_SETTINGS } from '../domain';

export const BUILT_IN_CHALLENGES = [
  'Pleši uz omiljenu pjesmu.',
  'Prošetaj 15 minuta.',
  'Nazovi dragu osobu.',
  'Popij čašu vode.',
  'Napravi kratku pauzu od ekrana.',
  'Poslušaj omiljenu pjesmu.',
  'Pohvali nekoga.',
  'Udahni duboko nekoliko puta.',
  'Uradi nešto kreativno.',
  'Prisjeti se lijepog trenutka.',
] as const;

export function themeId(themeKey: string): string {
  return `theme:${themeKey}`;
}

export function challengeId(index: number): string {
  return `challenge:built-in:${index + 1}`;
}

export const INITIAL_DAILY_PLANT_ID = 'plant:daily-gratitude:1';

export function initialThemeRows(createdAt: string) {
  return gratitudeThemes.map(theme => ({
    id: themeId(theme.key),
    key: theme.key,
    name: theme.name,
    description: theme.description,
    origin: 'built-in' as const,
    plantTypeId: theme.plantTypeId,
    isAutomatic: theme.isAutomatic,
    isActive: true,
    createdAt,
  }));
}

export function initialChallengeRows(createdAt: string) {
  return BUILT_IN_CHALLENGES.map((title, index) => ({
    id: challengeId(index),
    title,
    origin: 'built-in' as const,
    isActive: true,
    createdAt,
    updatedAt: createdAt,
  }));
}

export const initialSettingsRow = {
  id: 1,
  ...DEFAULT_APP_SETTINGS,
};
