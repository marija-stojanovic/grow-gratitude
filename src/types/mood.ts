import { EntityId, IsoDateTime, LocalDate } from './common';

export type MoodValue = 1 | 2 | 3 | 4 | 5;

/** Za jedan entryDate smije postojati samo jedan zapis raspoloženja. */
export interface MoodEntry {
  id: EntityId;
  value: MoodValue;
  entryDate: LocalDate;
  note: string | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}
