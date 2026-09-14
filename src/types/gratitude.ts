import { EntityId, IsoDateTime, LocalDate } from './common';

/** Zahvalnost je trajni, nepromjenjivi zapis jednog zalivanja. */
export interface GratitudeEntry {
  id: EntityId;
  plantId: EntityId;
  themeId: EntityId;
  text: string;
  entryDate: LocalDate;
  streakDay: number;
  createdAt: IsoDateTime;
}
