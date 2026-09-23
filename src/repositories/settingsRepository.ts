import type { AppSettings } from '../types';
import { mapAppSettingsRow, type AppSettingsRow } from '../database/rowMappers';
import { database, firstRow } from './repositoryHelpers';

export const settingsRepository = {
  async get(): Promise<AppSettings> {
    const db = await database();
    const result = await db.executeAsync<AppSettingsRow>(
      'SELECT * FROM app_settings WHERE id = 1 LIMIT 1',
    );
    const row = firstRow(result.rows);
    if (!row) {
      throw new Error('Postavke aplikacije nisu pronađene.');
    }
    return mapAppSettingsRow(row);
  },

  async save(settings: AppSettings): Promise<void> {
    const db = await database();
    await db.executeAsync(
      `UPDATE app_settings SET
        theme_preference = ?, notifications_enabled = ?,
        notification_time = ?, onboarding_completed = ?,
        last_shown_challenge_id = ?, language = ?
       WHERE id = 1`,
      [
        settings.themePreference,
        settings.notificationsEnabled,
        settings.notificationTime,
        settings.onboardingCompleted,
        settings.lastShownChallengeId,
        settings.language,
      ],
    );
  },
};
