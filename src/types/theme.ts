import { EntityId, IsoDateTime } from './common';

export type BuiltInThemeKey =
  | 'daily-gratitude'
  | 'family'
  | 'health'
  | 'university'
  | 'friendship'
  | 'love'
  | 'personal-growth';

export type ThemeOrigin = 'built-in' | 'custom';

/** Tema predstavlja jedan trajni sektor u bašti. */
export interface GratitudeTheme {
  id: EntityId;
  key: BuiltInThemeKey | null;
  name: string;
  description: string;
  origin: ThemeOrigin;
  plantTypeId: EntityId;
  isAutomatic: boolean;
  isActive: boolean;
  createdAt: IsoDateTime;
}
