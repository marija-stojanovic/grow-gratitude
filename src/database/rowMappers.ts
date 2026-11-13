import type { QueryResultRow } from 'react-native-nitro-sqlite';
import type {
  AppSettings,
  Challenge,
  ChallengeCompletion,
  GratitudeEntry,
  GratitudeTheme,
  MoodEntry,
  Plant,
} from '../types';

export interface ThemeRow extends QueryResultRow {
  id: string;
  theme_key: string | null;
  name: string;
  description: string;
  origin: 'built-in' | 'custom';
  plant_type_id: string;
  is_automatic: number;
  is_active: number;
  created_at: string;
}

export interface PlantRow extends QueryResultRow {
  id: string;
  theme_id: string;
  plant_type_id: string;
  name: string;
  cycle_number: number;
  is_automatic: number;
  status: 'growing' | 'withered' | 'completed';
  current_streak: number;
  total_waterings: number;
  last_watered_on: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface GratitudeEntryRow extends QueryResultRow {
  id: string;
  plant_id: string;
  theme_id: string;
  text: string;
  entry_date: string;
  streak_day: number;
  created_at: string;
}

export interface MoodEntryRow extends QueryResultRow {
  id: string;
  mood_value: number;
  entry_date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChallengeRow extends QueryResultRow {
  id: string;
  title: string;
  origin: 'built-in' | 'custom';
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface ChallengeCompletionRow extends QueryResultRow {
  id: string;
  challenge_id: string;
  completion_date: string;
  completed_at: string;
}

export interface AppSettingsRow extends QueryResultRow {
  theme_preference: 'system' | 'light' | 'dark';
  notifications_enabled: number;
  notification_time: string;
  onboarding_completed: number;
  last_shown_challenge_id: string | null;
  language: 'sr-Latn-ijekavian';
}

const toBoolean = (value: number): boolean => value === 1;

export const mapThemeRow = (row: ThemeRow): GratitudeTheme => ({
  id: row.id,
  key: row.theme_key as GratitudeTheme['key'],
  name: row.name,
  description: row.description,
  origin: row.origin,
  plantTypeId: row.plant_type_id,
  isAutomatic: toBoolean(row.is_automatic),
  isActive: toBoolean(row.is_active),
  createdAt: row.created_at,
});

export const mapPlantRow = (row: PlantRow): Plant => ({
  id: row.id,
  themeId: row.theme_id,
  plantTypeId: row.plant_type_id,
  name: row.name,
  cycleNumber: row.cycle_number,
  isAutomatic: toBoolean(row.is_automatic),
  status: row.status,
  currentStreak: row.current_streak,
  totalWaterings: row.total_waterings,
  lastWateredOn: row.last_watered_on,
  createdAt: row.created_at,
  completedAt: row.completed_at,
});

export const mapGratitudeEntryRow = (
  row: GratitudeEntryRow,
): GratitudeEntry => ({
  id: row.id,
  plantId: row.plant_id,
  themeId: row.theme_id,
  text: row.text,
  entryDate: row.entry_date,
  streakDay: row.streak_day,
  createdAt: row.created_at,
});

export const mapMoodEntryRow = (row: MoodEntryRow): MoodEntry => ({
  id: row.id,
  value: row.mood_value as MoodEntry['value'],
  entryDate: row.entry_date,
  note: row.note,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapChallengeRow = (row: ChallengeRow): Challenge => ({
  id: row.id,
  title: row.title,
  origin: row.origin,
  isActive: toBoolean(row.is_active),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapChallengeCompletionRow = (
  row: ChallengeCompletionRow,
): ChallengeCompletion => ({
  id: row.id,
  challengeId: row.challenge_id,
  completionDate: row.completion_date,
  completedAt: row.completed_at,
});

export const mapAppSettingsRow = (row: AppSettingsRow): AppSettings => ({
  themePreference:
    row.theme_preference === 'dark' ? 'dark' : 'light',
  notificationsEnabled: toBoolean(row.notifications_enabled),
  notificationTime: row.notification_time,
  onboardingCompleted: toBoolean(row.onboarding_completed),
  lastShownChallengeId: row.last_shown_challenge_id,
  language: row.language,
});
