import type { GratitudeEntry } from '../types';
import {
  mapGratitudeEntryRow,
  type GratitudeEntryRow,
} from '../database/rowMappers';
import { database, firstRow } from './repositoryHelpers';

export const gratitudeRepository = {
  async findById(id: string): Promise<GratitudeEntry | null> {
    const db = await database();
    const result = await db.executeAsync<GratitudeEntryRow>(
      'SELECT * FROM gratitude_entries WHERE id = ? LIMIT 1',
      [id],
    );
    const row = firstRow(result.rows);
    return row ? mapGratitudeEntryRow(row) : null;
  },

  async findForPlant(plantId: string): Promise<GratitudeEntry[]> {
    const db = await database();
    const result = await db.executeAsync<GratitudeEntryRow>(
      `SELECT * FROM gratitude_entries
       WHERE plant_id = ? ORDER BY entry_date DESC, created_at DESC`,
      [plantId],
    );
    return result.rows._array.map(mapGratitudeEntryRow);
  },

  async findForDate(entryDate: string): Promise<GratitudeEntry[]> {
    const db = await database();
    const result = await db.executeAsync<GratitudeEntryRow>(
      `SELECT * FROM gratitude_entries
       WHERE entry_date = ? ORDER BY created_at DESC`,
      [entryDate],
    );
    return result.rows._array.map(mapGratitudeEntryRow);
  },

  async findAll(): Promise<GratitudeEntry[]> {
    const db = await database();
    const result = await db.executeAsync<GratitudeEntryRow>(
      'SELECT * FROM gratitude_entries ORDER BY entry_date DESC, created_at DESC',
    );
    return result.rows._array.map(mapGratitudeEntryRow);
  },

  async existsForPlantOnDate(
    plantId: string,
    entryDate: string,
  ): Promise<boolean> {
    const db = await database();
    const result = await db.executeAsync<GratitudeEntryRow>(
      `SELECT * FROM gratitude_entries
       WHERE plant_id = ? AND entry_date = ? LIMIT 1`,
      [plantId, entryDate],
    );
    return result.rows.length > 0;
  },

  async create(entry: GratitudeEntry): Promise<void> {
    const db = await database();
    await db.executeAsync(
      `INSERT INTO gratitude_entries (
        id, plant_id, theme_id, text, entry_date, streak_day, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.plantId,
        entry.themeId,
        entry.text,
        entry.entryDate,
        entry.streakDay,
        entry.createdAt,
      ],
    );
  },
};
