import { EntityId } from './common';

/** Lokalno vrijeme u obliku HH:mm. */
export type LocalTime = string;
export type ThemePreference = 'light' | 'dark';

export interface AppSettings {
  themePreference: ThemePreference;
  notificationsEnabled: boolean;
  notificationTime: LocalTime;
  onboardingCompleted: boolean;
  lastShownChallengeId: EntityId | null;
  language: 'sr-Latn-ijekavian';
}
