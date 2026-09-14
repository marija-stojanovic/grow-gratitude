import { IsoDateTime, Plant } from '../types';

export function hasActivePlantForTheme(
  plants: Plant[],
  themeId: string,
): boolean {
  return plants.some(
    plant => plant.themeId === themeId && plant.status !== 'completed',
  );
}

export function nextCycleNumber(plants: Plant[], themeId: string): number {
  const highestCycle = plants
    .filter(plant => plant.themeId === themeId)
    .reduce((highest, plant) => Math.max(highest, plant.cycleNumber), 0);
  return highestCycle + 1;
}

/** Priprema novu biljku poslije završenog ciklusa. ID dodjeljuje baza. */
export function createNextCyclePlant(
  completedPlant: Plant,
  id: string,
  createdAt: IsoDateTime,
): Plant {
  if (completedPlant.status !== 'completed') {
    throw new Error('Novi ciklus može početi tek nakon završenog ciklusa.');
  }
  return {
    id,
    themeId: completedPlant.themeId,
    plantTypeId: completedPlant.plantTypeId,
    name: completedPlant.name,
    cycleNumber: completedPlant.cycleNumber + 1,
    isAutomatic: completedPlant.isAutomatic,
    status: 'growing',
    currentStreak: 0,
    totalWaterings: 0,
    lastWateredOn: null,
    createdAt,
    completedAt: null,
  };
}

export interface PlantDeletionPlan {
  plantId: string;
  deleteRelatedGratitudes: true;
  requiresConfirmation: true;
}

export function planPlantDeletion(plantId: string): PlantDeletionPlan {
  return {
    plantId,
    deleteRelatedGratitudes: true,
    requiresConfirmation: true,
  };
}
