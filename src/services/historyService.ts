import { challengeRepository } from '../repositories/challengeRepository';
import { gratitudeRepository } from '../repositories/gratitudeRepository';
import { plantRepository } from '../repositories/plantRepository';
import { themeRepository } from '../repositories/themeRepository';
import type {
  Challenge,
  ChallengeCompletion,
  GratitudeEntry,
  GratitudeTheme,
  Plant,
} from '../types';

export interface HistoryData {
  gratitudes: GratitudeEntry[];
  completedPlants: Plant[];
  allPlants: Plant[];
  challenges: Challenge[];
  challengeCompletions: ChallengeCompletion[];
  themes: GratitudeTheme[];
}

/** Učitava sve podatke potrebne ekranu Istorija jednim paralelnim korakom. */
export async function loadHistoryData(): Promise<HistoryData> {
  const [
    gratitudes,
    allPlants,
    challenges,
    challengeCompletions,
    themes,
  ] = await Promise.all([
    gratitudeRepository.findAll(),
    plantRepository.findAll(),
    challengeRepository.findAll(),
    challengeRepository.findAllCompletions(),
    themeRepository.findAll(),
  ]);

  const completedPlants = allPlants
    .filter(plant => plant.status === 'completed')
    .sort((first, second) =>
      (second.completedAt ?? '').localeCompare(first.completedAt ?? ''),
    );

  return {
    gratitudes,
    completedPlants,
    allPlants,
    challenges,
    challengeCompletions,
    themes,
  };
}
