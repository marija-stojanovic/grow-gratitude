jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    getNotificationSettings: jest.fn(),
    requestPermission: jest.fn(),
    createChannel: jest.fn(),
    createTriggerNotification: jest.fn(),
    cancelNotification: jest.fn(),
    openNotificationSettings: jest.fn(),
  },
  AndroidImportance: { DEFAULT: 3 },
  AuthorizationStatus: { DENIED: 0, AUTHORIZED: 1 },
  RepeatFrequency: { DAILY: 1 },
  TriggerType: { TIMESTAMP: 0 },
}));

import notifee from '@notifee/react-native';
import type { NotificationSettings } from '@notifee/react-native';
import {
  DAILY_REMINDER_ID,
  getNextReminderTimestamp,
  NotificationError,
  scheduleDailyReminder,
  syncReminderSchedule,
} from '../src/services/notificationService';

const mockGetNotificationSettings = jest.mocked(
  notifee.getNotificationSettings,
);
const mockRequestPermission = jest.mocked(notifee.requestPermission);
const mockCreateChannel = jest.mocked(notifee.createChannel);
const mockCreateTriggerNotification = jest.mocked(
  notifee.createTriggerNotification,
);
const mockCancelNotification = jest.mocked(notifee.cancelNotification);

const permission = (authorizationStatus: number) =>
  ({ authorizationStatus } as NotificationSettings);

beforeEach(() => {
  jest.clearAllMocks();
  mockGetNotificationSettings.mockResolvedValue(permission(1));
  mockRequestPermission.mockResolvedValue(permission(1));
  mockCreateChannel.mockResolvedValue('growgratitude-daily-reminders');
  mockCreateTriggerNotification.mockResolvedValue(DAILY_REMINDER_ID);
  mockCancelNotification.mockResolvedValue(undefined);
});

test('računa današnji termin kada vrijeme tek slijedi', () => {
  const now = new Date(2026, 8, 24, 19, 30, 15);
  const timestamp = getNextReminderTimestamp('20:00', now);

  expect(new Date(timestamp)).toEqual(new Date(2026, 8, 24, 20, 0, 0));
});

test('računa sutrašnji termin kada je današnje vrijeme prošlo', () => {
  const now = new Date(2026, 8, 24, 21, 0, 0);
  const timestamp = getNextReminderTimestamp('20:00', now);

  expect(new Date(timestamp)).toEqual(new Date(2026, 8, 25, 20, 0, 0));
});

test('traži dozvolu i zakazuje jedan dnevni podsjetnik', async () => {
  mockGetNotificationSettings.mockResolvedValue(permission(0));

  await scheduleDailyReminder('20:00', true);

  expect(mockRequestPermission).toHaveBeenCalledTimes(1);
  expect(mockCreateChannel).toHaveBeenCalledWith(
    expect.objectContaining({
      id: 'growgratitude-daily-reminders',
      name: 'GrowGratitude podsjetnici',
    }),
  );
  expect(mockCreateTriggerNotification).toHaveBeenCalledWith(
    expect.objectContaining({ id: DAILY_REMINDER_ID }),
    expect.objectContaining({ type: 0, repeatFrequency: 1 }),
  );
});

test('ne zakazuje podsjetnik kada korisnik odbije dozvolu', async () => {
  mockGetNotificationSettings.mockResolvedValue(permission(0));
  mockRequestPermission.mockResolvedValue(permission(0));

  await expect(scheduleDailyReminder('20:00', true)).rejects.toMatchObject<
    Partial<NotificationError>
  >({ code: 'permission-denied' });
  expect(mockCreateTriggerNotification).not.toHaveBeenCalled();
});

test('isključena postavka otkazuje postojeći dnevni podsjetnik', async () => {
  await syncReminderSchedule({
    notificationsEnabled: false,
    notificationTime: '20:00',
  });

  expect(mockCancelNotification).toHaveBeenCalledWith(DAILY_REMINDER_ID);
  expect(mockCreateTriggerNotification).not.toHaveBeenCalled();
});
