import type { Transaction } from 'react-native-nitro-sqlite';
import { getDatabase, initializeDatabase } from '../database/connection';
import { mapPlantRow, type PlantRow } from '../database/rowMappers';
import {
  createNextCyclePlant,
  decideWatering,
  validateGratitude,
} from '../domain';
import { isLocalDate } from '../domain/dateRules';
import type { GratitudeEntry, IsoDateTime, LocalDate, Plant } from '../types';

export type WateringErrorCode =
  | 'plant-not-found'
  | 'invalid-gratitude'
  | 'invalid-date'
  | 'duplicate-day'
  | 'date-moved-backward'
  | 'already-completed';

export class WateringError extends Error {
  constructor(public readonly code: WateringErrorCode, message: string) {
    super(message);
    this.name = 'WateringError';
  }
}

export interface SaveGratitudeInput {
  id: string;
  plantId: string;
  text: string;
  entryDate: LocalDate;
  createdAt: IsoDateTime;
}

export interface SaveGratitudeResult {
  gratitude: GratitudeEntry;
  /** Biljka koja je upravo zalivena; može biti završena sa 21/21. */
  plant: Plant;
  /** Novi aktivni suncokret ili null kada novi ciklus nije automatski. */
  nextPlant: Plant | null;
  restartedAfterMiss: boolean;
  completedNow: boolean;
  startNextCycleAutomatically: boolean;
  offerNextCycle: boolean;
}

function nextCyclePlantId(plant: Plant): string {
  return `plant:${plant.themeId}:cycle:${plant.cycleNumber + 1}`;
}

async function readPlant(
  transaction: Transaction,
  plantId: string,
): Promise<Plant> {
  const result = await transaction.executeAsync<PlantRow>(
    'SELECT * FROM plants WHERE id = ? LIMIT 1',
    [plantId],
  );
  const row = result.rows.item(0);
  if (!row) {
    throw new WateringError(
      'plant-not-found',
      'Biljka koju želite zaliti nije pronađena.',
    );
  }
  return mapPlantRow(row);
}

function wateringError(
  outcome: Exclude<ReturnType<typeof decideWatering>['outcome'], 'watered'>,
): WateringError {
  switch (outcome) {
    case 'duplicate-day':
      return new WateringError(
        outcome,
        'Ova biljka je već zalivena izabranog dana.',
      );
    case 'date-moved-backward':
      return new WateringError(
        outcome,
        'Datum unosa ne može biti prije posljednjeg zalivanja.',
      );
    case 'already-completed':
      return new WateringError(
        outcome,
        'Završena biljka se više ne može zalivati.',
      );
  }
}

/**
 * Upisuje zahvalnost, mijenja biljku i po potrebi pravi naredni automatski
 * suncokret u istoj SQLite transakciji.
 */
export async function saveGratitudeAndWaterPlant(
  input: SaveGratitudeInput,
): Promise<SaveGratitudeResult> {
  const validatedText = validateGratitude(input.text);
  if (!validatedText.valid) {
    throw new WateringError(
      'invalid-gratitude',
      validatedText.reason === 'required'
        ? 'Unesite zahvalnost prije zalivanja biljke.'
        : 'Zahvalnost može imati najviše 300 znakova.',
    );
  }
  if (!isLocalDate(input.entryDate)) {
    throw new WateringError('invalid-date', 'Datum unosa nije ispravan.');
  }

  await initializeDatabase();
  const database = getDatabase();

  return database.transaction(async transaction => {
    const currentPlant = await readPlant(transaction, input.plantId);
    const decision = decideWatering(currentPlant, input.entryDate);
    if (decision.outcome !== 'watered') {
      throw wateringError(decision.outcome);
    }

    const gratitude: GratitudeEntry = {
      id: input.id,
      plantId: currentPlant.id,
      themeId: currentPlant.themeId,
      text: validatedText.value,
      entryDate: input.entryDate,
      streakDay: decision.nextStreak,
      createdAt: input.createdAt,
    };
    const updatedPlant: Plant = {
      ...currentPlant,
      status: decision.nextStatus,
      currentStreak: decision.nextStreak,
      totalWaterings: decision.nextTotalWaterings,
      lastWateredOn: input.entryDate,
      completedAt: decision.completedNow ? input.createdAt : null,
    };

    await transaction.executeAsync(
      `INSERT INTO gratitude_entries (
        id, plant_id, theme_id, text, entry_date, streak_day, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        gratitude.id,
        gratitude.plantId,
        gratitude.themeId,
        gratitude.text,
        gratitude.entryDate,
        gratitude.streakDay,
        gratitude.createdAt,
      ],
    );
    await transaction.executeAsync(
      `UPDATE plants SET
        status = ?, current_streak = ?, total_waterings = ?,
        last_watered_on = ?, completed_at = ?
       WHERE id = ?`,
      [
        updatedPlant.status,
        updatedPlant.currentStreak,
        updatedPlant.totalWaterings,
        updatedPlant.lastWateredOn,
        updatedPlant.completedAt,
        updatedPlant.id,
      ],
    );

    let nextPlant: Plant | null = null;
    if (decision.startNextCycleAutomatically) {
      nextPlant = createNextCyclePlant(
        updatedPlant,
        nextCyclePlantId(updatedPlant),
        input.createdAt,
      );
      await transaction.executeAsync(
        `INSERT INTO plants (
          id, theme_id, plant_type_id, name, cycle_number, is_automatic,
          status, current_streak, total_waterings, last_watered_on,
          created_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nextPlant.id,
          nextPlant.themeId,
          nextPlant.plantTypeId,
          nextPlant.name,
          nextPlant.cycleNumber,
          nextPlant.isAutomatic,
          nextPlant.status,
          nextPlant.currentStreak,
          nextPlant.totalWaterings,
          nextPlant.lastWateredOn,
          nextPlant.createdAt,
          nextPlant.completedAt,
        ],
      );
    }

    return {
      gratitude,
      plant: updatedPlant,
      nextPlant,
      restartedAfterMiss: decision.restartedAfterMiss,
      completedNow: decision.completedNow,
      startNextCycleAutomatically: decision.startNextCycleAutomatically,
      offerNextCycle: decision.offerNextCycle,
    };
  });
}
