import {
  LocalDate,
  Plant,
  PlantGrowthStage,
  PlantLifecycleStatus,
} from '../types';
import { calendarDaysBetween } from './dateRules';

export const DAYS_TO_COMPLETE_PLANT = 21;

export interface PlantViewState {
  status: PlantLifecycleStatus;
  stage: PlantGrowthStage;
  /** Posljednja zdrava faza; potrebna za odgovarajuću uvenulu sliku. */
  witheredFromStage: PlantGrowthStage | null;
  streak: number;
  canWaterToday: boolean;
}

export type WateringDecision =
  | { outcome: 'duplicate-day' | 'date-moved-backward' | 'already-completed' }
  | {
      outcome: 'watered';
      nextStreak: number;
      nextTotalWaterings: number;
      nextStatus: PlantLifecycleStatus;
      restartedAfterMiss: boolean;
      completedNow: boolean;
      startNextCycleAutomatically: boolean;
      offerNextCycle: boolean;
    };

export function growthStageFor(streak: number): PlantGrowthStage {
  if (streak <= 0) return 'seed';
  if (streak <= 4) return 'sprout';
  if (streak <= 8) return 'small';
  if (streak <= 12) return 'medium';
  if (streak <= 16) return 'large';
  if (streak <= 20) return 'almost-grown';
  return 'fully-grown';
}

/** Izračunava ono što treba prikazati danas, bez mijenjanja zapisa biljke. */
export function plantViewState(plant: Plant, today: LocalDate): PlantViewState {
  if (plant.status === 'completed') {
    return {
      status: 'completed',
      stage: 'fully-grown',
      witheredFromStage: null,
      streak: DAYS_TO_COMPLETE_PLANT,
      canWaterToday: false,
    };
  }
  if (!plant.lastWateredOn) {
    return {
      status: 'growing',
      stage: 'seed',
      witheredFromStage: null,
      streak: 0,
      canWaterToday: true,
    };
  }
  const gap = calendarDaysBetween(plant.lastWateredOn, today);
  if (gap > 1) {
    return {
      status: 'withered',
      stage: 'withered',
      witheredFromStage: growthStageFor(plant.currentStreak),
      streak: 0,
      canWaterToday: true,
    };
  }
  return {
    status: plant.status,
    stage: growthStageFor(plant.currentStreak),
    witheredFromStage: null,
    streak: plant.currentStreak,
    canWaterToday: gap === 1,
  };
}

/** Odlučuje rezultat zalivanja. Baza će odluku i zahvalnost sačuvati zajedno. */
export function decideWatering(
  plant: Plant,
  entryDate: LocalDate,
): WateringDecision {
  if (plant.status === 'completed') {
    return { outcome: 'already-completed' };
  }
  const gap = plant.lastWateredOn
    ? calendarDaysBetween(plant.lastWateredOn, entryDate)
    : null;
  if (gap === 0) {
    return { outcome: 'duplicate-day' };
  }
  if (gap !== null && gap < 0) {
    return { outcome: 'date-moved-backward' };
  }
  const restartedAfterMiss = gap !== null && gap > 1;
  const nextStreak =
    gap === null || restartedAfterMiss ? 1 : plant.currentStreak + 1;
  const completedNow = nextStreak >= DAYS_TO_COMPLETE_PLANT;
  return {
    outcome: 'watered',
    nextStreak: Math.min(nextStreak, DAYS_TO_COMPLETE_PLANT),
    nextTotalWaterings: plant.totalWaterings + 1,
    nextStatus: completedNow ? 'completed' : 'growing',
    restartedAfterMiss,
    completedNow,
    startNextCycleAutomatically: completedNow && plant.isAutomatic,
    offerNextCycle: completedNow && !plant.isAutomatic,
  };
}

export function cycleProgressMessage(plant: Plant): string {
  if (plant.status === 'completed') {
    return `Čestitamo! Uspješno ste završili ${plant.cycleNumber}. ciklus.`;
  }
  return `Čestitamo! Vaš ${plant.cycleNumber}. ciklus je u toku.`;
}

export function streakProgressMessage(streak: number): string {
  return `${Math.max(
    0,
    Math.min(streak, DAYS_TO_COMPLETE_PLANT),
  )}/${DAYS_TO_COMPLETE_PLANT} uzastopnih dana`;
}
