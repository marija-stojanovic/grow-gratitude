import { isLocalDate } from '../domain/dateRules';
import { moodRepository } from '../repositories/moodRepository';
import type { IsoDateTime, LocalDate, MoodEntry, MoodValue } from '../types';

export type MoodSaveErrorCode = 'invalid-date' | 'invalid-value';

export class MoodSaveError extends Error {
  constructor(public readonly code: MoodSaveErrorCode, message: string) {
    super(message);
    this.name = 'MoodSaveError';
  }
}

export interface SaveDailyMoodInput {
  value: MoodValue;
  entryDate: LocalDate;
  savedAt: IsoDateTime;
}

export interface SaveDailyMoodResult {
  entry: MoodEntry;
  updatedExistingEntry: boolean;
}

/**
 * Čuva jedan zapis raspoloženja po datumu. Ako zapis već postoji, zadržava
 * njegov ID i vrijeme nastanka, a mijenja vrijednost i vrijeme izmjene.
 */
export async function saveDailyMood(
  input: SaveDailyMoodInput,
): Promise<SaveDailyMoodResult> {
  if (!isLocalDate(input.entryDate)) {
    throw new MoodSaveError(
      'invalid-date',
      'Datum raspoloženja nije ispravan.',
    );
  }
  if (![1, 2, 3, 4, 5].includes(input.value)) {
    throw new MoodSaveError(
      'invalid-value',
      'Izaberite jedan od pet ponuđenih nivoa raspoloženja.',
    );
  }

  const existingEntry = await moodRepository.findByDate(input.entryDate);
  const entry: MoodEntry = {
    id: existingEntry?.id ?? `mood:${input.entryDate}`,
    value: input.value,
    entryDate: input.entryDate,
    note: existingEntry?.note ?? null,
    createdAt: existingEntry?.createdAt ?? input.savedAt,
    updatedAt: input.savedAt,
  };

  await moodRepository.save(entry);
  return { entry, updatedExistingEntry: existingEntry !== null };
}
