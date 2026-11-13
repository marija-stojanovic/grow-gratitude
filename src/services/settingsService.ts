import { settingsRepository } from '../repositories/settingsRepository';
import { isLocalTime } from '../domain';
import type { AppSettings, ThemePreference } from '../types';

export const APP_LANGUAGE = 'sr-Latn-ijekavian' as const;

export type EditableSettings = Pick<
  AppSettings,
  'themePreference' | 'notificationsEnabled' | 'notificationTime'
>;
export type SettingsUpdate = Partial<EditableSettings>;

export type SettingsErrorCode = 'invalid-theme' | 'invalid-notification-time';

export class SettingsError extends Error {
  constructor(public readonly code: SettingsErrorCode, message: string) {
    super(message);
    this.name = 'SettingsError';
  }
}

function isThemePreference(value: string): value is ThemePreference {
  return value === 'light' || value === 'dark';
}

export async function loadAppSettings(): Promise<AppSettings> {
  return settingsRepository.get();
}

/** Čita posljednje stanje, spaja izmjenu i čuva cijeli red postavki. */
export async function updateAppSettings(
  update: SettingsUpdate,
): Promise<AppSettings> {
  if (
    update.themePreference !== undefined &&
    !isThemePreference(update.themePreference)
  ) {
    throw new SettingsError('invalid-theme', 'Izabrana tema nije ispravna.');
  }
  if (
    update.notificationTime !== undefined &&
    !isLocalTime(update.notificationTime)
  ) {
    throw new SettingsError(
      'invalid-notification-time',
      'Vrijeme podsjetnika mora biti u formatu HH:mm.',
    );
  }

  const current = await settingsRepository.get();
  const next: AppSettings = {
    ...current,
    ...update,
    language: APP_LANGUAGE,
  };
  await settingsRepository.save(next);
  return next;
}
