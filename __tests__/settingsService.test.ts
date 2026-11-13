jest.mock('../src/repositories/settingsRepository', () => ({
  settingsRepository: {
    get: jest.fn(),
    save: jest.fn(),
  },
}));

import { settingsRepository } from '../src/repositories/settingsRepository';
import {
  loadAppSettings,
  SettingsError,
  updateAppSettings,
} from '../src/services/settingsService';
import { isLocalTime } from '../src/domain';
import type { AppSettings } from '../src/types';

const mockGet = jest.mocked(settingsRepository.get);
const mockSave = jest.mocked(settingsRepository.save);

const savedSettings: AppSettings = {
  themePreference: 'light',
  notificationsEnabled: false,
  notificationTime: '20:00',
  onboardingCompleted: true,
  lastShownChallengeId: 'challenge:walk',
  language: 'sr-Latn-ijekavian',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockResolvedValue(savedSettings);
  mockSave.mockResolvedValue(undefined);
});

test('učitava sačuvane postavke iz repozitorija', async () => {
  await expect(loadAppSettings()).resolves.toEqual(savedSettings);
  expect(mockGet).toHaveBeenCalledTimes(1);
});

test('čuva novu temu i zadržava ostale postavke', async () => {
  const result = await updateAppSettings({ themePreference: 'dark' });

  expect(result).toEqual({ ...savedSettings, themePreference: 'dark' });
  expect(mockSave).toHaveBeenCalledWith(result);
});

test('uključuje podsjetnik i mijenja njegovo vrijeme', async () => {
  const result = await updateAppSettings({
    notificationsEnabled: true,
    notificationTime: '08:30',
  });

  expect(result.notificationsEnabled).toBe(true);
  expect(result.notificationTime).toBe('08:30');
  expect(result.language).toBe('sr-Latn-ijekavian');
  expect(mockSave).toHaveBeenCalledWith(result);
});

test.each(['8:00', '24:00', '20:60', 'tekst'])(
  'odbija neispravno vrijeme %s',
  async invalidTime => {
    await expect(
      updateAppSettings({ notificationTime: invalidTime }),
    ).rejects.toMatchObject<Partial<SettingsError>>({
      code: 'invalid-notification-time',
    });
    expect(mockGet).not.toHaveBeenCalled();
    expect(mockSave).not.toHaveBeenCalled();
  },
);

test('prepoznaje ispravne granične vrijednosti vremena', () => {
  expect(isLocalTime('00:00')).toBe(true);
  expect(isLocalTime('23:59')).toBe(true);
});
