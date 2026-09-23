import {
  canDeactivateChallenge,
  canDeleteChallenge,
  canEditChallenge,
  validateChallengeTitle,
} from '../domain';
import { challengeRepository } from '../repositories/challengeRepository';
import type { Challenge, IsoDateTime } from '../types';

export type ChallengeManagementErrorCode =
  | 'challenge-not-found'
  | 'built-in-read-only'
  | 'invalid-title'
  | 'duplicate-title'
  | 'last-active-challenge'
  | 'write-failed';

export class ChallengeManagementError extends Error {
  constructor(
    public readonly code: ChallengeManagementErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ChallengeManagementError';
  }
}

function validatedTitle(title: string): string {
  const validation = validateChallengeTitle(title);
  if (!validation.valid) {
    throw new ChallengeManagementError(
      'invalid-title',
      validation.reason === 'required'
        ? 'Unesite naziv izazova.'
        : 'Naziv izazova može imati najviše 100 znakova.',
    );
  }
  return validation.value;
}

async function ensureUniqueTitle(title: string, ignoredId?: string) {
  const existing = await challengeRepository.findByTitle(title);
  if (existing && existing.id !== ignoredId) {
    throw new ChallengeManagementError(
      'duplicate-title',
      'Izazov sa ovim nazivom već postoji.',
    );
  }
}

export async function createCustomChallenge(input: {
  id: string;
  title: string;
  createdAt: IsoDateTime;
}): Promise<Challenge> {
  const title = validatedTitle(input.title);
  await ensureUniqueTitle(title);
  const challenge: Challenge = {
    id: input.id,
    title,
    origin: 'custom',
    isActive: true,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  };
  await challengeRepository.create(challenge);
  return challenge;
}

export async function renameCustomChallenge(input: {
  id: string;
  title: string;
  updatedAt: IsoDateTime;
}): Promise<Challenge> {
  const challenge = await challengeRepository.findById(input.id);
  if (!challenge) {
    throw new ChallengeManagementError(
      'challenge-not-found',
      'Izazov nije pronađen.',
    );
  }
  if (!canEditChallenge(challenge)) {
    throw new ChallengeManagementError(
      'built-in-read-only',
      'Ugrađeni izazovi se ne mogu uređivati.',
    );
  }
  const title = validatedTitle(input.title);
  await ensureUniqueTitle(title, challenge.id);
  const updated = await challengeRepository.updateCustom(
    challenge.id,
    title,
    input.updatedAt,
  );
  if (!updated) {
    throw new ChallengeManagementError(
      'write-failed',
      'Izazov nije moguće izmijeniti.',
    );
  }
  return { ...challenge, title, updatedAt: input.updatedAt };
}

export async function setChallengeActive(input: {
  id: string;
  isActive: boolean;
  updatedAt: IsoDateTime;
}): Promise<Challenge> {
  const [challenge, challenges] = await Promise.all([
    challengeRepository.findById(input.id),
    challengeRepository.findAll(),
  ]);
  if (!challenge) {
    throw new ChallengeManagementError(
      'challenge-not-found',
      'Izazov nije pronađen.',
    );
  }
  if (
    !input.isActive &&
    challenge.isActive &&
    !canDeactivateChallenge(challenge.id, challenges)
  ) {
    throw new ChallengeManagementError(
      'last-active-challenge',
      'Najmanje jedan Spin Wheel izazov mora ostati aktivan.',
    );
  }
  const updated = await challengeRepository.setActive(
    challenge.id,
    input.isActive,
    input.updatedAt,
  );
  if (!updated) {
    throw new ChallengeManagementError(
      'write-failed',
      'Status izazova nije moguće promijeniti.',
    );
  }
  return {
    ...challenge,
    isActive: input.isActive,
    updatedAt: input.updatedAt,
  };
}

export async function deleteCustomChallenge(id: string): Promise<Challenge> {
  const [challenge, challenges] = await Promise.all([
    challengeRepository.findById(id),
    challengeRepository.findAll(),
  ]);
  if (!challenge) {
    throw new ChallengeManagementError(
      'challenge-not-found',
      'Izazov nije pronađen.',
    );
  }
  if (!canDeleteChallenge(challenge)) {
    throw new ChallengeManagementError(
      'built-in-read-only',
      'Ugrađeni izazovi se ne mogu brisati.',
    );
  }
  if (challenge.isActive && !canDeactivateChallenge(challenge.id, challenges)) {
    throw new ChallengeManagementError(
      'last-active-challenge',
      'Posljednji aktivni izazov se ne može obrisati.',
    );
  }
  const deleted = await challengeRepository.deleteCustom(challenge.id);
  if (!deleted) {
    throw new ChallengeManagementError(
      'write-failed',
      'Izazov nije moguće obrisati.',
    );
  }
  return challenge;
}
