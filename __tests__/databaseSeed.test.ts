import {
  BUILT_IN_CHALLENGES,
  INITIAL_DAILY_PLANT_ID,
  initialChallengeRows,
  initialSettingsRow,
  initialThemeRows,
} from '../src/database/seed';

const CREATED_AT = '2026-09-14T08:00:00.000Z';

test('priprema sedam ugrađenih tema', () => {
  const themes = initialThemeRows(CREATED_AT);
  expect(themes).toHaveLength(7);
  expect(themes[0]).toMatchObject({
    id: 'theme:daily-gratitude',
    plantTypeId: 'sunflower',
    isAutomatic: true,
  });
});

test('priprema početne aktivne izazove sa stabilnim identifikatorima', () => {
  const challenges = initialChallengeRows(CREATED_AT);
  expect(challenges).toHaveLength(BUILT_IN_CHALLENGES.length);
  expect(challenges.every(challenge => challenge.isActive)).toBe(true);
  expect(challenges[0].id).toBe('challenge:built-in:1');
});

test('koristi dogovorene početne postavke i biljku', () => {
  expect(INITIAL_DAILY_PLANT_ID).toBe('plant:daily-gratitude:1');
  expect(initialSettingsRow).toMatchObject({
    id: 1,
    notificationTime: '20:00',
    notificationsEnabled: false,
    language: 'sr-Latn-ijekavian',
  });
});
