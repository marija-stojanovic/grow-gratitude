jest.mock('../src/repositories/challengeRepository', () => ({
  challengeRepository: {
    findById: jest.fn(),
    findCompletionByDate: jest.fn(),
    addCompletion: jest.fn(),
  },
}));

import { challengeRepository } from '../src/repositories/challengeRepository';
import {
  completeChallenge,
  selectRandomChallenge,
  SpinWheelError,
} from '../src/services/spinWheelService';
import type { Challenge } from '../src/types';

const mockFindById = jest.mocked(challengeRepository.findById);
const mockFindCompletionByDate = jest.mocked(
  challengeRepository.findCompletionByDate,
);
const mockAddCompletion = jest.mocked(challengeRepository.addCompletion);

const challenges: Challenge[] = [
  {
    id: 'one',
    title: 'Prošetaj 15 minuta.',
    origin: 'built-in',
    isActive: true,
    createdAt: '2026-09-23T08:00:00.000Z',
    updatedAt: '2026-09-23T08:00:00.000Z',
  },
  {
    id: 'two',
    title: 'Popij čašu vode.',
    origin: 'built-in',
    isActive: true,
    createdAt: '2026-09-23T08:00:00.000Z',
    updatedAt: '2026-09-23T08:00:00.000Z',
  },
];

beforeEach(() => jest.clearAllMocks());

test('nasumično bira jedan od aktivnih izazova', () => {
  expect(selectRandomChallenge(challenges, () => 0)).toBe(challenges[0]);
  expect(selectRandomChallenge(challenges, () => 0.75)).toBe(challenges[1]);
});

test('odbija izbor kada nema aktivnih izazova', () => {
  expect(() => selectRandomChallenge([])).toThrow(SpinWheelError);
});

test('evidentira izvršeni izazov za današnji datum', async () => {
  mockFindById.mockResolvedValue(challenges[0]);
  mockFindCompletionByDate.mockResolvedValue(null);
  mockAddCompletion.mockResolvedValue(undefined);

  const result = await completeChallenge({
    challengeId: challenges[0].id,
    completionDate: '2026-09-23',
    completedAt: '2026-09-23T19:00:00.000Z',
  });

  expect(result.alreadyCompleted).toBe(false);
  expect(result.completion).toMatchObject({
    challengeId: challenges[0].id,
    completionDate: '2026-09-23',
  });
  expect(mockAddCompletion).toHaveBeenCalledWith(result.completion);
});

test('ne upisuje ponovo već izvršen izazov istog dana', async () => {
  const completion = {
    id: 'existing-completion',
    challengeId: challenges[0].id,
    completionDate: '2026-09-23',
    completedAt: '2026-09-23T18:00:00.000Z',
  };
  mockFindById.mockResolvedValue(challenges[0]);
  mockFindCompletionByDate.mockResolvedValue(completion);

  const result = await completeChallenge({
    challengeId: challenges[0].id,
    completionDate: '2026-09-23',
    completedAt: '2026-09-23T19:00:00.000Z',
  });

  expect(result).toEqual({ completion, alreadyCompleted: true });
  expect(mockAddCompletion).not.toHaveBeenCalled();
});
