import type { Plant } from '../types';
import { mapPlantRow, type PlantRow } from '../database/rowMappers';
import { database, firstRow } from './repositoryHelpers';

async function insertPlant(plant: Plant): Promise<void> {
  const db = await database();
  await db.executeAsync(
    `INSERT INTO plants (
      id, theme_id, plant_type_id, name, cycle_number, is_automatic,
      status, current_streak, total_waterings, last_watered_on,
      created_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      plant.id,
      plant.themeId,
      plant.plantTypeId,
      plant.name,
      plant.cycleNumber,
      plant.isAutomatic,
      plant.status,
      plant.currentStreak,
      plant.totalWaterings,
      plant.lastWateredOn,
      plant.createdAt,
      plant.completedAt,
    ],
  );
}

export const plantRepository = {
  async findAll(): Promise<Plant[]> {
    const db = await database();
    const result = await db.executeAsync<PlantRow>(
      'SELECT * FROM plants ORDER BY created_at DESC',
    );
    return result.rows._array.map(mapPlantRow);
  },

  async findById(id: string): Promise<Plant | null> {
    const db = await database();
    const result = await db.executeAsync<PlantRow>(
      'SELECT * FROM plants WHERE id = ? LIMIT 1',
      [id],
    );
    const row = firstRow(result.rows);
    return row ? mapPlantRow(row) : null;
  },

  async findAllForTheme(themeId: string): Promise<Plant[]> {
    const db = await database();
    const result = await db.executeAsync<PlantRow>(
      'SELECT * FROM plants WHERE theme_id = ? ORDER BY cycle_number DESC',
      [themeId],
    );
    return result.rows._array.map(mapPlantRow);
  },

  async findActiveForTheme(themeId: string): Promise<Plant | null> {
    const db = await database();
    const result = await db.executeAsync<PlantRow>(
      `SELECT * FROM plants
       WHERE theme_id = ? AND status IN ('growing', 'withered')
       LIMIT 1`,
      [themeId],
    );
    const row = firstRow(result.rows);
    return row ? mapPlantRow(row) : null;
  },

  async findAutomaticActive(): Promise<Plant | null> {
    const db = await database();
    const result = await db.executeAsync<PlantRow>(
      `SELECT * FROM plants
       WHERE is_automatic = 1 AND status IN ('growing', 'withered')
       ORDER BY created_at DESC LIMIT 1`,
    );
    const row = firstRow(result.rows);
    return row ? mapPlantRow(row) : null;
  },

  create: insertPlant,

  async rename(id: string, name: string): Promise<boolean> {
    const db = await database();
    const result = await db.executeAsync(
      'UPDATE plants SET name = ? WHERE id = ?',
      [name.trim(), id],
    );
    return (result.rowsAffected ?? 0) > 0;
  },

  async saveState(plant: Plant): Promise<boolean> {
    const db = await database();
    const result = await db.executeAsync(
      `UPDATE plants SET
        status = ?, current_streak = ?, total_waterings = ?,
        last_watered_on = ?, completed_at = ?
       WHERE id = ?`,
      [
        plant.status,
        plant.currentStreak,
        plant.totalWaterings,
        plant.lastWateredOn,
        plant.completedAt,
        plant.id,
      ],
    );
    return (result.rowsAffected ?? 0) > 0;
  },

  async deleteById(id: string): Promise<boolean> {
    const db = await database();
    const result = await db.executeAsync('DELETE FROM plants WHERE id = ?', [
      id,
    ]);
    return (result.rowsAffected ?? 0) > 0;
  },
};
