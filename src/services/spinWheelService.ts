import { isLocalDate } from '../domain/dateRules';
import { challengeRepository } from '../repositories/challengeRepository';
import type {
  Challenge,
  ChallengeCompletion,
  IsoDateTime,
  LocalDate,
} from '../types';

export type SpinWheelErrorCode =
  | 'no-active-challenges'
  | 'challenge-not-found'
  | 'challenge-inactive'
  | 'invalid-date';

export class SpinWheelError extends Error {
  constructor(public readonly code: SpinWheelErrorCode, message: string) {
    super(message);
    this.name = 'SpinWheelError';
  }
}

export function selectRandomChallenge(
  challenges: Challenge[],
  random: () => number = Math.random,
): Challenge {
  if (challenges.length === 0) {
    throw new SpinWheelError(
      'no-active-challenges',
      'Nema aktivnih izazova za Spin Wheel.',
    );
  }
  const index = Math.min(
    challenges.length - 1,
    Math.floor(random() * challenges.length),
  );
  return challenges[Math.max(0, index)];
}

export interface CompleteChallengeInput {
  challengeId: string;
  completionDate: LocalDate;
  completedAt: IsoDateTime;
}

export interface CompleteChallengeResult {
  completion: ChallengeCompletion;
  alreadyCompleted: boolean;
}

/** Evidentira najviše jedno izvršenje istog izazova za izabrani datum. */
export async function completeChallenge(
  input: CompleteChallengeInput,
): Promise<CompleteChallengeResult> {
  if (!isLocalDate(input.completionDate)) {
    throw new SpinWheelError('invalid-date', 'Datum izazova nije ispravan.');
  }

  const challenge = await challengeRepository.findById(input.challengeId);
  if (!challenge) {
    throw new SpinWheelError(
      'challenge-not-found',
      'Izabrani izazov nije pronađen.',
    );
  }
  if (!challenge.isActive) {
    throw new SpinWheelError(
      'challenge-inactive',
      'Izabrani izazov više nije aktivan.',
    );
  }

  const existingCompletion = await challengeRepository.findCompletionByDate(
    challenge.id,
    input.completionDate,
  );
  if (existingCompletion) {
    return { completion: existingCompletion, alreadyCompleted: true };
  }

  const completion: ChallengeCompletion = {
    id: `challenge-completion:${challenge.id}:${input.completionDate}`,
    challengeId: challenge.id,
    completionDate: input.completionDate,
    completedAt: input.completedAt,
  };
  await challengeRepository.addCompletion(completion);
  return { completion, alreadyCompleted: false };
}
