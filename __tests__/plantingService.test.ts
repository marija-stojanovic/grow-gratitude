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
  addCompletedDemoPlantToGarden,
  PlantingError,
  startPlantForTheme,
} from '../src/services/plantingService';

const themeRow = {
  id: 'theme:family',
  theme_key: 'family',
  name: 'Porodica',
  description: '',
  origin: 'built-in',
  plant_type_id: 'family-plant-pending',
  is_automatic: 0,
  is_active: 1,
  created_at: '2026-09-14T08:00:00.000Z',
};

beforeEach(() => jest.clearAllMocks());

test('sadi prvi ciklus u izabranoj temi', async () => {
  mockExecuteAsync
    .mockResolvedValueOnce({ rows: { item: () => themeRow } })
    .mockResolvedValueOnce({ rows: { length: 0 } })
    .mockResolvedValueOnce({ rows: { item: () => ({ last_cycle: 0 }) } })
    .mockResolvedValueOnce({ rowsAffected: 1 });

  const plant = await startPlantForTheme(
    themeRow.id,
    '2026-09-21T08:00:00.000Z',
  );

  expect(plant).toMatchObject({
    themeId: themeRow.id,
    cycleNumber: 1,
    currentStreak: 0,
    status: 'growing',
  });
  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(mockExecuteAsync).toHaveBeenCalledTimes(4);
});

test('poslije završenih biljaka sadi naredni ciklus', async () => {
  mockExecuteAsync
    .mockResolvedValueOnce({ rows: { item: () => themeRow } })
    .mockResolvedValueOnce({ rows: { length: 0 } })
    .mockResolvedValueOnce({ rows: { item: () => ({ last_cycle: 2 }) } })
    .mockResolvedValueOnce({ rowsAffected: 1 });

  const plant = await startPlantForTheme(
    themeRow.id,
    '2026-09-21T08:00:00.000Z',
  );
  expect(plant.cycleNumber).toBe(3);
});

test('čuva korisnički naziv nove biljke', async () => {
  mockExecuteAsync
    .mockResolvedValueOnce({ rows: { item: () => themeRow } })
    .mockResolvedValueOnce({ rows: { length: 0 } })
    .mockResolvedValueOnce({ rows: { item: () => ({ last_cycle: 0 }) } })
    .mockResolvedValueOnce({ rowsAffected: 1 });

  const plant = await startPlantForTheme(
    themeRow.id,
    '2026-09-21T08:00:00.000Z',
    '  Moj porodični suncokret  ',
  );

  expect(plant.name).toBe('Moj porodični suncokret');
  expect(mockExecuteAsync).toHaveBeenLastCalledWith(
    expect.stringContaining('INSERT INTO plants'),
    expect.arrayContaining(['Moj porodični suncokret']),
  );
});

test('odbija prazan naziv prije otvaranja baze', async () => {
  await expect(
    startPlantForTheme(themeRow.id, '2026-09-21T08:00:00.000Z', '   '),
  ).rejects.toMatchObject<Partial<PlantingError>>({ code: 'invalid-name' });
  expect(mockTransaction).not.toHaveBeenCalled();
});

test('odbija drugu aktivnu biljku iste teme prije upisa', async () => {
  mockExecuteAsync
    .mockResolvedValueOnce({ rows: { item: () => themeRow } })
    .mockResolvedValueOnce({ rows: { length: 1 } });

  await expect(
    startPlantForTheme(themeRow.id, '2026-09-21T08:00:00.000Z'),
  ).rejects.toMatchObject<Partial<PlantingError>>({
    code: 'active-plant-exists',
  });
  expect(mockExecuteAsync).toHaveBeenCalledTimes(2);
});

test('automatski suncokret se ne može ručno zasaditi', async () => {
  mockExecuteAsync.mockResolvedValueOnce({
    rows: { item: () => ({ ...themeRow, is_automatic: 1 }) },
  });

  await expect(
    startPlantForTheme(themeRow.id, '2026-09-21T08:00:00.000Z'),
  ).rejects.toMatchObject<Partial<PlantingError>>({ code: 'automatic-theme' });
  expect(mockExecuteAsync).toHaveBeenCalledTimes(1);
});

test('dodaje završenu demo biljku kao novi ciklus izabrane teme', async () => {
  mockExecuteAsync
    .mockResolvedValueOnce({ rows: { item: () => themeRow } })
    .mockResolvedValueOnce({ rows: { item: () => ({ last_cycle: 2 }) } })
    .mockResolvedValueOnce({ rowsAffected: 1 });

  const plant = await addCompletedDemoPlantToGarden(
    themeRow.id,
    '2026-09-30T15:00:00.000Z',
  );

  expect(plant).toMatchObject({
    themeId: themeRow.id,
    cycleNumber: 3,
    status: 'completed',
    currentStreak: 21,
    totalWaterings: 21,
    completedAt: '2026-09-30T15:00:00.000Z',
  });
  expect(mockExecuteAsync).toHaveBeenLastCalledWith(
    expect.stringContaining('INSERT INTO plants'),
    expect.arrayContaining(['completed', 21, 21]),
  );
});

test('dodaje završenu demo biljku i u automatski dnevni sektor', async () => {
  mockExecuteAsync
    .mockResolvedValueOnce({
      rows: { item: () => ({ ...themeRow, is_automatic: 1 }) },
    })
    .mockResolvedValueOnce({ rows: { item: () => ({ last_cycle: 4 }) } })
    .mockResolvedValueOnce({ rowsAffected: 1 });

  const plant = await addCompletedDemoPlantToGarden(
    themeRow.id,
    '2026-09-30T15:00:00.000Z',
  );

  expect(plant).toMatchObject({
    cycleNumber: 5,
    isAutomatic: true,
    name: 'Demo dnevni suncokret',
    status: 'completed',
  });
});
