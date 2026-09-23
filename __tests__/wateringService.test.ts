const mockExecuteAsync = jest.fn();
const mockTransaction = jest.fn(
  async (
    callback: (value: {
      executeAsync: typeof mockExecuteAsync;
    }) => Promise<unknown>,
  ) => callback({ executeAsync: mockExecuteAsync }),
);

jest.mock('../src/database/connection', () => ({
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
  getDatabase: jest.fn(() => ({ transaction: mockTransaction })),
}));

import {
  saveGratitudeAndWaterPlant,
  WateringError,
} from '../src/services/wateringService';

const plantRow = {
  id: 'plant-1',
  theme_id: 'theme:daily-gratitude',
  plant_type_id: 'sunflower',
  name: 'Dnevni suncokret',
  cycle_number: 1,
  is_automatic: 1,
  status: 'growing',
  current_streak: 7,
  total_waterings: 7,
  last_watered_on: '2026-09-15',
  created_at: '2026-09-09T08:00:00.000Z',
  completed_at: null,
};

const input = {
  id: 'gratitude-8',
  plantId: 'plant-1',
  text: '  Zahvalna sam na porodici.  ',
  entryDate: '2026-09-16',
  createdAt: '2026-09-16T18:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('upisuje zahvalnost i nastavak niza u jednoj transakciji', async () => {
  mockExecuteAsync
    .mockResolvedValueOnce({ rows: { item: () => plantRow } })
    .mockResolvedValueOnce({ rowsAffected: 1 })
    .mockResolvedValueOnce({ rowsAffected: 1 });

  const result = await saveGratitudeAndWaterPlant(input);

  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(result.gratitude.text).toBe('Zahvalna sam na porodici.');
  expect(result.gratitude.streakDay).toBe(8);
  expect(result.plant.currentStreak).toBe(8);
  expect(result.plant.totalWaterings).toBe(8);
  expect(result.nextPlant).toBeNull();
  expect(result.completedNow).toBe(false);
  expect(mockExecuteAsync).toHaveBeenCalledTimes(3);
});

test('nakon 21/21 završava suncokret i pravi naredni ciklus', async () => {
  mockExecuteAsync
    .mockResolvedValueOnce({
      rows: {
        item: () => ({
          ...plantRow,
          current_streak: 20,
          total_waterings: 20,
        }),
      },
    })
    .mockResolvedValueOnce({ rowsAffected: 1 })
    .mockResolvedValueOnce({ rowsAffected: 1 })
    .mockResolvedValueOnce({ rowsAffected: 1 });

  const result = await saveGratitudeAndWaterPlant(input);

  expect(result.completedNow).toBe(true);
  expect(result.plant).toMatchObject({
    status: 'completed',
    currentStreak: 21,
    cycleNumber: 1,
  });
  expect(result.nextPlant).toMatchObject({
    id: 'plant:theme:daily-gratitude:cycle:2',
    status: 'growing',
    currentStreak: 0,
    totalWaterings: 0,
    cycleNumber: 2,
  });
  expect(mockExecuteAsync).toHaveBeenCalledTimes(4);
});

test('nakon preskočenog dana ponovo počinje od 1/21', async () => {
  mockExecuteAsync
    .mockResolvedValueOnce({
      rows: { item: () => ({ ...plantRow, last_watered_on: '2026-09-14' }) },
    })
    .mockResolvedValueOnce({ rowsAffected: 1 })
    .mockResolvedValueOnce({ rowsAffected: 1 });

  const result = await saveGratitudeAndWaterPlant(input);

  expect(result.restartedAfterMiss).toBe(true);
  expect(result.plant.currentStreak).toBe(1);
  expect(result.gratitude.streakDay).toBe(1);
});

test('odbija drugi unos istog dana prije INSERT i UPDATE upita', async () => {
  mockExecuteAsync.mockResolvedValueOnce({
    rows: { item: () => ({ ...plantRow, last_watered_on: '2026-09-16' }) },
  });

  await expect(saveGratitudeAndWaterPlant(input)).rejects.toMatchObject<
    Partial<WateringError>
  >({ code: 'duplicate-day' });
  expect(mockExecuteAsync).toHaveBeenCalledTimes(1);
});

test('odbija prazan tekst prije otvaranja transakcije', async () => {
  await expect(
    saveGratitudeAndWaterPlant({ ...input, text: '   ' }),
  ).rejects.toMatchObject<Partial<WateringError>>({
    code: 'invalid-gratitude',
  });
  expect(mockTransaction).not.toHaveBeenCalled();
});
