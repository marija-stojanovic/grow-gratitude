import { plantViewState } from '../../domain';
import type { Plant } from '../../types';

export function gardenPlantStatus(plant: Plant, today: string): string {
  if (plant.status === 'completed') {
    return 'Potpuno odrasla';
  }
  return plantViewState(plant, today).stage === 'withered'
    ? 'Uvenula'
    : 'Aktivna';
}

export function formatGardenDate(value: string | null): string {
  if (!value) {
    return 'Još nije zalivena';
  }
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${day}.${month}.${year}.`;
}

export function sortSectorPlants(plants: Plant[]): Plant[] {
  return [...plants].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') {
      return 1;
    }
    if (a.status !== 'completed' && b.status === 'completed') {
      return -1;
    }
    return b.cycleNumber - a.cycleNumber;
  });
}
