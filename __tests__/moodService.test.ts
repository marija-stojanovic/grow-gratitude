jest.mock('../src/repositories/moodRepository', () => ({
  moodRepository: {
    findByDate: jest.fn(),
    save: jest.fn(),
  },
}));

import { moodRepository } from '../src/repositories/moodRepository';
import { saveDailyMood } from '../src/services/moodService';
import { shouldOfferSpinWheel } from '../src/domain/moodRules';

const mockFindByDate = jest.mocked(moodRepository.findByDate);
const mockSave = jest.mocked(moodRepository.save);

beforeEach(() => jest.clearAllMocks());

test('čuva prvi unos raspoloženja za izabrani datum', async () => {
  mockFindByDate.mockResolvedValue(null);
  mockSave.mockResolvedValue(undefined);

  const result = await saveDailyMood({
    value: 4,
    entryDate: '2026-09-23',
    savedAt: '2026-09-23T18:00:00.000Z',
  });

  expect(result.updatedExistingEntry).toBe(false);
  expect(result.entry).toMatchObject({
    id: 'mood:2026-09-23',
    value: 4,
    entryDate: '2026-09-23',
  });
  expect(mockSave).toHaveBeenCalledWith(result.entry);
});

test('mijenja postojeći dnevni unos bez pravljenja novog identiteta', async () => {
  mockFindByDate.mockResolvedValue({
    id: 'existing-mood',
    value: 2,
    entryDate: '2026-09-23',
    note: null,
    createdAt: '2026-09-23T08:00:00.000Z',
    updatedAt: '2026-09-23T08:00:00.000Z',
  });
  mockSave.mockResolvedValue(undefined);

  const result = await saveDailyMood({
    value: 5,
    entryDate: '2026-09-23',
    savedAt: '2026-09-23T19:00:00.000Z',
  });

  expect(result.updatedExistingEntry).toBe(true);
  expect(result.entry).toMatchObject({
    id: 'existing-mood',
    value: 5,
    createdAt: '2026-09-23T08:00:00.000Z',
    updatedAt: '2026-09-23T19:00:00.000Z',
  });
  expect(mockSave).toHaveBeenCalledTimes(1);
});

test('nisko raspoloženje aktivira prijedlog za Spin Wheel', () => {
  expect(shouldOfferSpinWheel(1)).toBe(true);
  expect(shouldOfferSpinWheel(2)).toBe(true);
  expect(shouldOfferSpinWheel(3)).toBe(false);
  expect(shouldOfferSpinWheel(4)).toBe(false);
  expect(shouldOfferSpinWheel(5)).toBe(false);
});
