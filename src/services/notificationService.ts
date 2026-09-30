import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TriggerType,
  type TimestampTrigger,
} from '@notifee/react-native';
import { isLocalTime } from '../domain';
import type { AppSettings, LocalTime } from '../types';

export const REMINDER_CHANNEL_ID = 'growgratitude-daily-reminders';
export const DAILY_REMINDER_ID = 'growgratitude-daily-gratitude';

export type NotificationErrorCode =
  | 'permission-denied'
  | 'invalid-time'
  | 'schedule-failed';

export class NotificationError extends Error {
  constructor(public readonly code: NotificationErrorCode, message: string) {
    super(message);
    this.name = 'NotificationError';
  }
}

export function getNextReminderTimestamp(
  time: LocalTime,
  now = new Date(),
): number {
  if (!isLocalTime(time)) {
    throw new NotificationError(
      'invalid-time',
      'Vrijeme podsjetnika mora biti u formatu HH:mm.',
    );
  }

  const [hours, minutes] = time.split(':').map(Number);
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
}

async function ensureNotificationPermission(
  requestIfNeeded: boolean,
): Promise<void> {
  let permission = await notifee.getNotificationSettings();
  if (
    permission.authorizationStatus !== AuthorizationStatus.AUTHORIZED &&
    requestIfNeeded
  ) {
    permission = await notifee.requestPermission();
  }
  if (permission.authorizationStatus !== AuthorizationStatus.AUTHORIZED) {
    throw new NotificationError(
      'permission-denied',
      'Obavještenja nisu dozvoljena. Dozvoli ih u Android postavkama pa pokušaj ponovo.',
    );
  }
}

export async function scheduleDailyReminder(
  time: LocalTime,
  requestPermission = false,
): Promise<void> {
  await ensureNotificationPermission(requestPermission);
  const channelId = await notifee.createChannel({
    id: REMINDER_CHANNEL_ID,
    name: 'GrowGratitude podsjetnici',
    description: 'Dnevni podsjetnik za unos zahvalnosti.',
    importance: AndroidImportance.DEFAULT,
    sound: 'default',
    vibration: true,
  });
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: getNextReminderTimestamp(time),
    repeatFrequency: RepeatFrequency.DAILY,
  };

  try {
    await notifee.createTriggerNotification(
      {
        id: DAILY_REMINDER_ID,
        title: 'Vrijeme je za zahvalnost 🌻',
        body: 'Zalij svoj suncokret jednom lijepom mišlju iz današnjeg dana.',
        android: {
          channelId,
          pressAction: { id: 'default' },
          smallIcon: 'ic_launcher',
        },
      },
      trigger,
    );
  } catch {
    throw new NotificationError(
      'schedule-failed',
      'Dnevni podsjetnik trenutno nije moguće zakazati.',
    );
  }
}

export async function cancelDailyReminder(): Promise<void> {
  await notifee.cancelNotification(DAILY_REMINDER_ID);
}

export async function syncReminderSchedule(
  settings: Pick<AppSettings, 'notificationsEnabled' | 'notificationTime'>,
): Promise<void> {
  if (settings.notificationsEnabled) {
    await scheduleDailyReminder(settings.notificationTime);
  } else {
    await cancelDailyReminder();
  }
}

export async function openNotificationSettings(): Promise<void> {
  await notifee.openNotificationSettings();
}
