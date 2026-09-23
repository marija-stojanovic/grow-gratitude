const mockFindGratitudes = jest.fn();
const mockFindMoods = jest.fn();
const mockFindPlants = jest.fn();
const mockFindChallenges = jest.fn();
const mockFindCompletions = jest.fn();
const mockFindThemes = jest.fn();

jest.mock('../src/repositories/gratitudeRepository', () => ({
  gratitudeRepository: { findAll: mockFindGratitudes },
}));
jest.mock('../src/repositories/moodRepository', () => ({
  moodRepository: { findAll: mockFindMoods },
}));
jest.mock('../src/repositories/plantRepository', () => ({
  plantRepository: { findAll: mockFindPlants },
}));
jest.mock('../src/repositories/challengeRepository', () => ({
  challengeRepository: {
    findAll: mockFindChallenges,
    findAllCompletions: mockFindCompletions,
  },
}));
jest.mock('../src/repositories/themeRepository', () => ({
  themeRepository: { findAll: mockFindThemes },
}));

import { loadHistoryData } from '../src/services/historyService';
import type { Plant } from '../src/types';

const growingPlant: Plant = {
  id: 'growing',
  themeId: 'theme:daily',
  plantTypeId: 'sunflower',
  name: 'Suncokret',
  cycleNumber: 3,
  isAutomatic: true,
  status: 'growing',
  currentStreak: 2,
  totalWaterings: 2,
  lastWateredOn: '2026-09-23',
  createdAt: '2026-09-22T08:00:00.000Z',
  completedAt: null,
};
const olderCompleted: Plant = {
  ...growingPlant,
  id: 'completed-1',
  cycleNumber: 1,
  status: 'completed',
  currentStreak: 21,
  completedAt: '2026-08-20T08:00:00.000Z',
};
const newerCompleted: Plant = {
  ...olderCompleted,
  id: 'completed-2',
  cycleNumber: 2,
  completedAt: '2026-09-20T08:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockFindGratitudes.mockResolvedValue([]);
  mockFindMoods.mockResolvedValue([]);
  mockFindChallenges.mockResolvedValue([]);
  mockFindCompletions.mockResolvedValue([]);
  mockFindThemes.mockResolvedValue([]);
});

test('učitava sve kategorije istorije i izdvaja završene biljke', async () => {
  mockFindPlants.mockResolvedValue([
    growingPlant,
    olderCompleted,
    newerCompleted,
  ]);

  const history = await loadHistoryData();

  expect(history.allPlants).toHaveLength(3);
  expect(history.completedPlants.map(plant => plant.id)).toEqual([
    'completed-2',
    'completed-1',
  ]);
  expect(mockFindGratitudes).toHaveBeenCalledTimes(1);
  expect(mockFindMoods).toHaveBeenCalledTimes(1);
  expect(mockFindChallenges).toHaveBeenCalledTimes(1);
  expect(mockFindCompletions).toHaveBeenCalledTimes(1);
  expect(mockFindThemes).toHaveBeenCalledTimes(1);
});
