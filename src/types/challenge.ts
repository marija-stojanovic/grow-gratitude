import { EntityId, IsoDateTime, LocalDate } from './common';

export type ChallengeOrigin = 'built-in' | 'custom';

export interface Challenge {
  id: EntityId;
  title: string;
  origin: ChallengeOrigin;
  isActive: boolean;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface ChallengeCompletion {
  id: EntityId;
  challengeId: EntityId;
  completionDate: LocalDate;
  completedAt: IsoDateTime;
}
