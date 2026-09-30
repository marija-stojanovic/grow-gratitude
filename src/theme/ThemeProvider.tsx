import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { DEFAULT_APP_SETTINGS } from '../domain';
import {
  loadAppSettings,
  updateAppSettings,
  type SettingsUpdate,
} from '../services/settingsService';
import {
  cancelDailyReminder,
  scheduleDailyReminder,
  syncReminderSchedule,
} from '../services/notificationService';
import type { AppSettings, ThemePreference } from '../types/settings';
import { Colors, palettes } from './tokens';

type ThemeContextValue = {
  colors: Colors;
  isDark: boolean;
  preference: ThemePreference;
  settings: AppSettings;
  settingsLoading: boolean;
  settingsSaving: boolean;
  settingsError: string | null;
  setPreference: (value: ThemePreference) => Promise<boolean>;
  updateSettings: (update: SettingsUpdate) => Promise<boolean>;
  reloadSettings: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const reloadSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      const loadedSettings = await loadAppSettings();
      setSettings(loadedSettings);
      try {
        await syncReminderSchedule(loadedSettings);
      } catch (notificationError) {
        setSettingsError(
          notificationError instanceof Error
            ? notificationError.message
            : 'Dnevni podsjetnik trenutno nije moguće pripremiti.',
        );
      }
    } catch {
      setSettingsError(
        'Sačuvane postavke trenutno se ne mogu učitati. Koriste se početne vrijednosti.',
      );
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadSettings();
  }, [reloadSettings]);

  const updateSettings = useCallback(
    async (update: SettingsUpdate): Promise<boolean> => {
      if (settingsSaving) {
        return false;
      }
      setSettingsSaving(true);
      setSettingsError(null);
      try {
        const reminderChanged =
          update.notificationsEnabled !== undefined ||
          update.notificationTime !== undefined;
        if (reminderChanged) {
          const notificationsEnabled =
            update.notificationsEnabled ?? settings.notificationsEnabled;
          const notificationTime =
            update.notificationTime ?? settings.notificationTime;
          if (notificationsEnabled) {
            await scheduleDailyReminder(
              notificationTime,
              update.notificationsEnabled === true,
            );
          } else {
            await cancelDailyReminder();
          }
        }
        setSettings(await updateAppSettings(update));
        return true;
      } catch (caughtError) {
        setSettingsError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Postavke trenutno nije moguće sačuvati.',
        );
        return false;
      } finally {
        setSettingsSaving(false);
      }
    },
    [settings, settingsSaving],
  );

  const setPreference = useCallback(
    (value: ThemePreference) => updateSettings({ themePreference: value }),
    [updateSettings],
  );

  const preference = settings.themePreference;
  const isDark =
    preference === 'dark' ||
    (preference === 'system' && systemScheme === 'dark');

  return (
    <ThemeContext.Provider
      value={{
        colors: palettes[isDark ? 'dark' : 'light'],
        isDark,
        preference,
        settings,
        settingsLoading,
        settingsSaving,
        settingsError,
        setPreference,
        updateSettings,
        reloadSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme requires ThemeProvider');
  }
  return theme;
}
