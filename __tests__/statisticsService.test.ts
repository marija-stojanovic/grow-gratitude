jest.mock('../src/repositories/moodRepository', () => ({
  moodRepository: { findAll: jest.fn() },
}));
jest.mock('../src/repositories/gratitudeRepository', () => ({
  gratitudeRepository: { findAll: jest.fn() },
}));
jest.mock('../src/repositories/plantRepository', () => ({
  plantRepository: { findAll: jest.fn() },
}));
jest.mock('../src/repositories/challengeRepository', () => ({
  challengeRepository: { findAllCompletions: jest.fn() },
}));

import { moodRepository } from '../src/repositories/moodRepository';
import { gratitudeRepository } from '../src/repositories/gratitudeRepository';
import { plantRepository } from '../src/repositories/plantRepository';
import { challengeRepository } from '../src/repositories/challengeRepository';
import {
  calculateStatistics,
  loadStatisticsData,
} from '../src/services/statisticsService';
import type {
  ChallengeCompletion,
  GratitudeEntry,
  MoodEntry,
  MoodValue,
  Plant,
} from '../src/types';

const mockFindMoods = jest.mocked(moodRepository.findAll);
const mockFindGratitudes = jest.mocked(gratitudeRepository.findAll);
const mockFindPlants = jest.mocked(plantRepository.findAll);
const mockFindCompletions = jest.mocked(challengeRepository.findAllCompletions);

function mood(date: string, value: MoodValue): MoodEntry {
  return {
    id: `mood:${date}`,
    value,
    entryDate: date,
    note: null,
    createdAt: `${date}T08:00:00.000Z`,
    updatedAt: `${date}T08:00:00.000Z`,
  };
}

const growingPlant: Plant = {
  id: 'growing',
  themeId: 'daily',
  plantTypeId: 'sunflower',
  name: 'Suncokret',
  cycleNumber: 2,
  isAutomatic: true,
  status: 'growing',
  currentStreak: 3,
  totalWaterings: 3,
  lastWateredOn: '2026-09-23',
  createdAt: '2026-09-21T08:00:00.000Z',
  completedAt: null,
};
const completedPlant: Plant = {
  ...growingPlant,
  id: 'completed',
  cycleNumber: 1,
  status: 'completed',
  currentStreak: 21,
  completedAt: '2026-09-20T08:00:00.000Z',
};

const moods = [
  mood('2026-08-31', 4),
  mood('2026-09-01', 2),
  mood('2026-09-17', 1),
  mood('2026-09-20', 3),
  mood('2026-09-23', 5),
];

const gratitudes: GratitudeEntry[] = [
  {
    id: 'gratitude-1',
    plantId: 'plant-1',
    themeId: 'daily',
    text: 'Prvi unos',
    entryDate: '2026-09-01',
    streakDay: 1,
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'gratitude-2',
    plantId: 'plant-1',
    themeId: 'daily',
    text: 'Sedmi dan',
    entryDate: '2026-09-07',
    streakDay: 7,
    createdAt: '2026-09-07T08:00:00.000Z',
  },
  {
    id: 'gratitude-3',
    plantId: 'plant-1',
    themeId: 'daily',
    text: 'Završen ciklus',
    entryDate: '2026-09-21',
    streakDay: 21,
    createdAt: '2026-09-21T08:00:00.000Z',
  },
];

const challengeCompletions: ChallengeCompletion[] = [
  {
    id: 'completion-1',
    challengeId: 'challenge-1',
    completionDate: '2026-09-20',
    completedAt: '2026-09-20T18:00:00.000Z',
  },
  {
    id: 'completion-2',
    challengeId: 'challenge-2',
    completionDate: '2026-09-21',
    completedAt: '2026-09-21T18:00:00.000Z',
  },
  {
    id: 'duplicate-from-input',
    challengeId: 'challenge-2',
    completionDate: '2026-09-21',
    completedAt: '2026-09-21T18:00:01.000Z',
  },
];

test('računa sedmodnevni i mjesečni pregled bez popunjavanja praznih dana', () => {
  const result = calculateStatistics(
    moods,
    gratitudes,
    [growingPlant, completedPlant],
    challengeCompletions,
    '2026-09-23',
  );

  expect(result.lastSevenDays.map(day => day.date)).toEqual([
    '2026-09-17',
    '2026-09-18',
    '2026-09-19',
    '2026-09-20',
    '2026-09-21',
    '2026-09-22',
    '2026-09-23',
  ]);
  expect(result.lastSevenDays.map(day => day.value)).toEqual([
    1,
    null,
    null,
    3,
    null,
    null,
    5,
  ]);
  expect(result.weekSummary).toEqual({ average: 3, recordedDays: 3 });
  expect(result.monthSummary).toEqual({ average: 2.75, recordedDays: 4 });
  expect(result.currentMonth).toHaveLength(30);
  expect(result.currentMonth[23].isFuture).toBe(true);
  expect(result.totalGratitudes).toBe(3);
  expect(result.completedPlants).toBe(1);
  expect(result.completedChallenges).toBe(2);
  expect(result.longestGratitudeStreak).toBe(21);
});

test('učitava sve podatke potrebne za statistiku iz repozitorija', async () => {
  mockFindMoods.mockResolvedValue(moods);
  mockFindGratitudes.mockResolvedValue(gratitudes);
  mockFindPlants.mockResolvedValue([growingPlant, completedPlant]);
  mockFindCompletions.mockResolvedValue(challengeCompletions.slice(0, 2));

  const result = await loadStatisticsData('2026-09-23');

  expect(result.totalGratitudes).toBe(3);
  expect(result.completedPlants).toBe(1);
  expect(result.completedChallenges).toBe(2);
  expect(result.longestGratitudeStreak).toBe(21);
  expect(mockFindMoods).toHaveBeenCalledTimes(1);
  expect(mockFindGratitudes).toHaveBeenCalledTimes(1);
  expect(mockFindPlants).toHaveBeenCalledTimes(1);
  expect(mockFindCompletions).toHaveBeenCalledTimes(1);
});

test('bez zahvalnosti najduži niz je nula dana', () => {
  const result = calculateStatistics(moods, [], [], [], '2026-09-23');
  expect(result.totalGratitudes).toBe(0);
  expect(result.longestGratitudeStreak).toBe(0);
  expect(result.completedChallenges).toBe(0);
});
