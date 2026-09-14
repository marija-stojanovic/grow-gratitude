import type {
  NitroSQLiteConnection,
  QueryResultRow,
  Transaction,
} from 'react-native-nitro-sqlite';
import { CREATE_SCHEMA_V1, SCHEMA_VERSION } from './schema';
import {
  INITIAL_DAILY_PLANT_ID,
  initialChallengeRows,
  initialSettingsRow,
  initialThemeRows,
  themeId,
} from './seed';

interface UserVersionRow extends QueryResultRow {
  user_version: number;
}

async function readSchemaVersion(
  database: NitroSQLiteConnection,
): Promise<number> {
  const result = await database.executeAsync<UserVersionRow>(
    'PRAGMA user_version',
  );
  return result.rows.item(0)?.user_version ?? 0;
}

async function seedVersionOne(
  transaction: Transaction,
  createdAt: string,
): Promise<void> {
  for (const theme of initialThemeRows(createdAt)) {
    await transaction.executeAsync(
      `INSERT OR IGNORE INTO themes (
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
  }

  await transaction.executeAsync(
    `INSERT OR IGNORE INTO plants (
      id, theme_id, plant_type_id, name, cycle_number, is_automatic,
      status, current_streak, total_waterings, last_watered_on,
      created_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      INITIAL_DAILY_PLANT_ID,
      themeId('daily-gratitude'),
      'sunflower',
      'Dnevni suncokret',
      1,
      true,
      'growing',
      0,
      0,
      null,
      createdAt,
      null,
    ],
  );

  for (const challenge of initialChallengeRows(createdAt)) {
    await transaction.executeAsync(
      `INSERT OR IGNORE INTO challenges (
        id, title, origin, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        challenge.id,
        challenge.title,
        challenge.origin,
        challenge.isActive,
        challenge.createdAt,
        challenge.updatedAt,
      ],
    );
  }

  await transaction.executeAsync(
    `INSERT OR IGNORE INTO app_settings (
      id, theme_preference, notifications_enabled, notification_time,
      onboarding_completed, last_shown_challenge_id, language
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      initialSettingsRow.id,
      initialSettingsRow.themePreference,
      initialSettingsRow.notificationsEnabled,
      initialSettingsRow.notificationTime,
      initialSettingsRow.onboardingCompleted,
      initialSettingsRow.lastShownChallengeId,
      initialSettingsRow.language,
    ],
  );
}

async function migrateToVersionOne(
  database: NitroSQLiteConnection,
): Promise<void> {
  await database.transaction(async transaction => {
    for (const statement of CREATE_SCHEMA_V1) {
      await transaction.executeAsync(statement);
    }
    await seedVersionOne(transaction, new Date().toISOString());
    await transaction.executeAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  });
}

export async function runMigrations(
  database: NitroSQLiteConnection,
): Promise<void> {
  const currentVersion = await readSchemaVersion(database);
  if (currentVersion > SCHEMA_VERSION) {
    throw new Error(
      `Baza verzije ${currentVersion} novija je od podržane verzije ${SCHEMA_VERSION}.`,
    );
  }
  if (currentVersion < 1) {
    await migrateToVersionOne(database);
  }
}
