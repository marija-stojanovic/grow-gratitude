import type { MoodEntry } from '../types';
import { mapMoodEntryRow, type MoodEntryRow } from '../database/rowMappers';
import { database, firstRow } from './repositoryHelpers';

export const moodRepository = {
  async findByDate(entryDate: string): Promise<MoodEntry | null> {
    const db = await database();
    const result = await db.executeAsync<MoodEntryRow>(
      'SELECT * FROM mood_entries WHERE entry_date = ? LIMIT 1',
      [entryDate],
    );
    const row = firstRow(result.rows);
    return row ? mapMoodEntryRow(row) : null;
  },

  async findAll(): Promise<MoodEntry[]> {
    const db = await database();
    const result = await db.executeAsync<MoodEntryRow>(
      'SELECT * FROM mood_entries ORDER BY entry_date DESC',
    );
    return result.rows._array.map(mapMoodEntryRow);
  },

  async save(entry: MoodEntry): Promise<void> {
    const db = await database();
    await db.executeAsync(
      `INSERT INTO mood_entries (
        id, mood_value, entry_date, note, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(entry_date) DO UPDATE SET
        mood_value = excluded.mood_value,
        note = excluded.note,
        updated_at = excluded.updated_at`,
      [
        entry.id,
        entry.value,
        entry.entryDate,
        entry.note,
        entry.createdAt,
        entry.updatedAt,
      ],
    );
  },
};
