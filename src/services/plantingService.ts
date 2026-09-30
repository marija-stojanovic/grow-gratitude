import type { QueryResultRow } from 'react-native-nitro-sqlite';
import { getDatabase, initializeDatabase } from '../database/connection';
import { mapThemeRow, type ThemeRow } from '../database/rowMappers';
import type { Plant } from '../types';

export type PlantingErrorCode =
  | 'theme-not-found'
  | 'theme-inactive'
  | 'automatic-theme'
  | 'active-plant-exists'
  | 'invalid-name';

export class PlantingError extends Error {
  constructor(public readonly code: PlantingErrorCode, message: string) {
    super(message);
    this.name = 'PlantingError';
  }
}

interface LastCycleRow extends QueryResultRow {
  last_cycle: number;
}

/** Sadi sljedeći ciklus obične teme, uz zaštitu od duple aktivne biljke. */
export async function startPlantForTheme(
  themeId: string,
  createdAt: string,
  plantName?: string,
): Promise<Plant> {
  const normalizedName = plantName?.trim();
  if (
    plantName !== undefined &&
    (!normalizedName || normalizedName.length > 50)
  ) {
    throw new PlantingError(
      'invalid-name',
      'Naziv biljke mora imati između 1 i 50 znakova.',
    );
  }
  await initializeDatabase();
  const database = getDatabase();

  return database.transaction(async transaction => {
    const themeResult = await transaction.executeAsync<ThemeRow>(
      'SELECT * FROM themes WHERE id = ? LIMIT 1',
      [themeId],
    );
    const themeRow = themeResult.rows.item(0);
    if (!themeRow) {
      throw new PlantingError('theme-not-found', 'Tema nije pronađena.');
    }
    const theme = mapThemeRow(themeRow);
    if (!theme.isActive) {
      throw new PlantingError('theme-inactive', 'Ova tema nije aktivna.');
    }
    if (theme.isAutomatic) {
      throw new PlantingError(
        'automatic-theme',
        'Dnevni suncokret se sadi automatski.',
      );
    }

    const activeResult = await transaction.executeAsync<QueryResultRow>(
      `SELECT id FROM plants
       WHERE theme_id = ? AND status IN ('growing', 'withered') LIMIT 1`,
      [themeId],
    );
    if (activeResult.rows.length > 0) {
      throw new PlantingError(
        'active-plant-exists',
        'Za ovu temu već uzgajate biljku.',
      );
    }

    const cycleResult = await transaction.executeAsync<LastCycleRow>(
      'SELECT COALESCE(MAX(cycle_number), 0) AS last_cycle FROM plants WHERE theme_id = ?',
      [themeId],
    );
    const cycleNumber = (cycleResult.rows.item(0)?.last_cycle ?? 0) + 1;
    const plant: Plant = {
      id: `plant:${themeId}:cycle:${cycleNumber}`,
      themeId,
      plantTypeId: theme.plantTypeId,
      name: normalizedName ?? theme.name,
      cycleNumber,
      isAutomatic: false,
      status: 'growing',
      currentStreak: 0,
      totalWaterings: 0,
      lastWateredOn: null,
      createdAt,
      completedAt: null,
    };

    await transaction.executeAsync(
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
    return plant;
  });
}

/** Dodaje završenu demonstracionu biljku u izabrani sektor bez lažnih zahvalnosti. */
export async function addCompletedDemoPlantToGarden(
  themeId: string,
  completedAt: string,
): Promise<Plant> {
  await initializeDatabase();
  const database = getDatabase();

  return database.transaction(async transaction => {
    const themeResult = await transaction.executeAsync<ThemeRow>(
      'SELECT * FROM themes WHERE id = ? LIMIT 1',
      [themeId],
    );
    const themeRow = themeResult.rows.item(0);
    if (!themeRow) {
      throw new PlantingError('theme-not-found', 'Tema nije pronađena.');
    }
    const theme = mapThemeRow(themeRow);
    if (!theme.isActive) {
      throw new PlantingError('theme-inactive', 'Ova tema nije aktivna.');
    }
    const cycleResult = await transaction.executeAsync<LastCycleRow>(
      'SELECT COALESCE(MAX(cycle_number), 0) AS last_cycle FROM plants WHERE theme_id = ?',
      [themeId],
    );
    const cycleNumber = (cycleResult.rows.item(0)?.last_cycle ?? 0) + 1;
    const plant: Plant = {
      id: `plant:${themeId}:cycle:${cycleNumber}`,
      themeId,
      plantTypeId: theme.plantTypeId,
      name: theme.isAutomatic
        ? 'Demo dnevni suncokret'
        : `Demo ${theme.name.toLocaleLowerCase('sr-Latn')}`,
      cycleNumber,
      isAutomatic: theme.isAutomatic,
      status: 'completed',
      currentStreak: 21,
      totalWaterings: 21,
      lastWateredOn: completedAt.slice(0, 10),
      createdAt: completedAt,
      completedAt,
    };

    await transaction.executeAsync(
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
    return plant;
  });
}
