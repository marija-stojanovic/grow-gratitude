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
  deletePlantPermanently,
  PlantDeletionError,
} from '../src/services/plantDeletionService';

const plantRow = {
  id: 'plant-family-1',
  theme_id: 'theme:family',
  plant_type_id: 'family-plant',
  name: 'Porodica',
  cycle_number: 1,
  is_automatic: 0,
  status: 'growing',
  current_streak: 4,
  total_waterings: 4,
  last_watered_on: '2026-09-16',
  created_at: '2026-09-13T08:00:00.000Z',
  completed_at: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('briše potvrđenu biljku i prijavljuje broj njenih zahvalnosti', async () => {
  mockExecuteAsync
    .mockResolvedValueOnce({ rows: { item: () => plantRow } })
    .mockResolvedValueOnce({
      rows: { item: () => ({ gratitude_count: 4 }) },
    })
    .mockResolvedValueOnce({ rowsAffected: 1 });

  const result = await deletePlantPermanently({
    plantId: plantRow.id,
    confirmed: true,
  });

  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(result.deletedPlant.id).toBe(plantRow.id);
  expect(result.deletedGratitudeCount).toBe(4);
  expect(mockExecuteAsync).toHaveBeenLastCalledWith(
    'DELETE FROM plants WHERE id = ?',
    [plantRow.id],
  );
});

test('ne otvara bazu kada brisanje nije potvrđeno', async () => {
  await expect(
    deletePlantPermanently({ plantId: plantRow.id, confirmed: false }),
  ).rejects.toMatchObject<Partial<PlantDeletionError>>({
    code: 'confirmation-required',
  });
  expect(mockTransaction).not.toHaveBeenCalled();
});

test('ne pokušava DELETE kada biljka ne postoji', async () => {
  mockExecuteAsync.mockResolvedValueOnce({
    rows: { item: () => undefined },
  });

  await expect(
    deletePlantPermanently({ plantId: 'missing', confirmed: true }),
  ).rejects.toMatchObject<Partial<PlantDeletionError>>({
    code: 'plant-not-found',
  });
  expect(mockExecuteAsync).toHaveBeenCalledTimes(1);
});
