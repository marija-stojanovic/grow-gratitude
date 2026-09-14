import { Challenge } from '../types';

export function canEditChallenge(challenge: Challenge): boolean {
  return challenge.origin === 'custom';
}

export function canDeleteChallenge(challenge: Challenge): boolean {
  return challenge.origin === 'custom';
}

export function canDeactivateChallenge(
  challengeId: string,
  challenges: Challenge[],
): boolean {
  return challenges.some(
    challenge => challenge.id !== challengeId && challenge.isActive,
  );
}
