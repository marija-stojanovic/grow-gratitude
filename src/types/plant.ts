import { EntityId, IsoDateTime, LocalDate } from './common';

export type PlantLifecycleStatus = 'growing' | 'withered' | 'completed';
export type PlantGrowthStage =
  | 'seed'
  | 'sprout'
  | 'small'
  | 'medium'
  | 'large'
  | 'almost-grown'
  | 'fully-grown'
  | 'withered';

/** Jedna biljka predstavlja jedan ciklus unutar sektora/teme. */
export interface Plant {
  id: EntityId;
  themeId: EntityId;
  plantTypeId: EntityId;
  name: string;
  cycleNumber: number;
  isAutomatic: boolean;
  status: PlantLifecycleStatus;
  currentStreak: number;
  totalWaterings: number;
  lastWateredOn: LocalDate | null;
  createdAt: IsoDateTime;
  completedAt: IsoDateTime | null;
}
