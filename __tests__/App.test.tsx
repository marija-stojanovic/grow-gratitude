/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('../src/services/settingsService', () => ({
  loadAppSettings: jest.fn().mockResolvedValue({
    themePreference: 'light',
    notificationsEnabled: false,
    notificationTime: '20:00',
    onboardingCompleted: false,
    lastShownChallengeId: null,
    language: 'sr-Latn-ijekavian',
  }),
  updateAppSettings: jest.fn(),
}));

jest.mock('../src/services/notificationService', () => ({
  cancelDailyReminder: jest.fn().mockResolvedValue(undefined),
  scheduleDailyReminder: jest.fn().mockResolvedValue(undefined),
  syncReminderSchedule: jest.fn().mockResolvedValue(undefined),
}));

// Jest nema Android native module, pa u ovom testu zamjenjujemo samo
// pokretanje baze. Prava SQLite veza provjerava se na emulatoru.
jest.mock('../src/database/connection', () => ({
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
  getDatabase: jest.fn(() => ({
    executeAsync: jest.fn().mockResolvedValue({
      rows: { _array: [], length: 0, item: () => undefined },
    }),
  })),
}));

test('renders correctly', async () => {
  let renderer: ReturnType<typeof ReactTestRenderer.create> | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  await ReactTestRenderer.act(() => {
    renderer?.unmount();
  });
});
