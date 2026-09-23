import type { GratitudeTheme } from '../types';
import { mapThemeRow, type ThemeRow } from '../database/rowMappers';
import { database, firstRow } from './repositoryHelpers';

export const themeRepository = {
  async findAll(): Promise<GratitudeTheme[]> {
    const db = await database();
    const result = await db.executeAsync<ThemeRow>(
      'SELECT * FROM themes ORDER BY is_automatic DESC, created_at ASC',
    );
    return result.rows._array.map(mapThemeRow);
  },

  async findActive(): Promise<GratitudeTheme[]> {
    const db = await database();
    const result = await db.executeAsync<ThemeRow>(
      'SELECT * FROM themes WHERE is_active = 1 ORDER BY is_automatic DESC, created_at ASC',
    );
    return result.rows._array.map(mapThemeRow);
  },

  async findById(id: string): Promise<GratitudeTheme | null> {
    const db = await database();
    const result = await db.executeAsync<ThemeRow>(
      'SELECT * FROM themes WHERE id = ? LIMIT 1',
      [id],
    );
    const row = firstRow(result.rows);
    return row ? mapThemeRow(row) : null;
  },

  async create(theme: GratitudeTheme): Promise<void> {
    const db = await database();
    await db.executeAsync(
      `INSERT INTO themes (
        id, theme_key, name, description, origin, plant_type_id,
        is_automatic, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        theme.id,
        theme.key,
        theme.name,
        theme.description,
        theme.origin,
        theme.plantTypeId,
        theme.isAutomatic,
        theme.isActive,
        theme.createdAt,
      ],
    );
  },

  async setActive(id: string, isActive: boolean): Promise<boolean> {
    const db = await database();
    const result = await db.executeAsync(
      'UPDATE themes SET is_active = ? WHERE id = ?',
      [isActive, id],
    );
    return (result.rowsAffected ?? 0) > 0;
  },
};
