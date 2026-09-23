import type { QueryResultRow, Transaction } from 'react-native-nitro-sqlite';
import { getDatabase, initializeDatabase } from '../database/connection';
import { mapPlantRow, type PlantRow } from '../database/rowMappers';
import type { Plant } from '../types';

export type PlantDeletionErrorCode =
  | 'confirmation-required'
  | 'plant-not-found'
  | 'delete-failed';

export class PlantDeletionError extends Error {
  constructor(public readonly code: PlantDeletionErrorCode, message: string) {
    super(message);
    this.name = 'PlantDeletionError';
  }
}

export interface DeletePlantInput {
  plantId: string;
  confirmed: boolean;
}

export interface DeletePlantResult {
  deletedPlant: Plant;
  deletedGratitudeCount: number;
}

interface GratitudeCountRow extends QueryResultRow {
  gratitude_count: number;
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
    throw new PlantDeletionError(
      'plant-not-found',
      'Biljka koju želite obrisati nije pronađena.',
    );
  }
  return mapPlantRow(row);
}

/**
 * Trajno briše biljku nakon potvrde. SQLite ON DELETE CASCADE u istoj
 * transakciji automatski briše sve zahvalnosti povezane s biljkom.
 */
export async function deletePlantPermanently(
  input: DeletePlantInput,
): Promise<DeletePlantResult> {
  if (!input.confirmed) {
    throw new PlantDeletionError(
      'confirmation-required',
      'Trajno brisanje biljke mora biti potvrđeno.',
    );
  }

  await initializeDatabase();
  const database = getDatabase();

  return database.transaction(async transaction => {
    const deletedPlant = await readPlant(transaction, input.plantId);
    const countResult = await transaction.executeAsync<GratitudeCountRow>(
      `SELECT COUNT(*) AS gratitude_count
       FROM gratitude_entries WHERE plant_id = ?`,
      [input.plantId],
    );
    const deletedGratitudeCount =
      countResult.rows.item(0)?.gratitude_count ?? 0;

    const deleteResult = await transaction.executeAsync(
      'DELETE FROM plants WHERE id = ?',
      [input.plantId],
    );
    if (deleteResult.rowsAffected !== 1) {
      throw new PlantDeletionError(
        'delete-failed',
        'Biljka nije obrisana. Pokušajte ponovo.',
      );
    }

    return { deletedPlant, deletedGratitudeCount };
  });
}
