import { challengeRepository } from '../repositories/challengeRepository';
import { gratitudeRepository } from '../repositories/gratitudeRepository';
import { moodRepository } from '../repositories/moodRepository';
import { plantRepository } from '../repositories/plantRepository';
import { themeRepository } from '../repositories/themeRepository';
import type {
  Challenge,
  ChallengeCompletion,
  GratitudeEntry,
  GratitudeTheme,
  MoodEntry,
  Plant,
} from '../types';

export interface HistoryData {
  gratitudes: GratitudeEntry[];
  moods: MoodEntry[];
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
    moods,
    allPlants,
    challenges,
    challengeCompletions,
    themes,
  ] = await Promise.all([
    gratitudeRepository.findAll(),
    moodRepository.findAll(),
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
    moods,
    completedPlants,
    allPlants,
    challenges,
    challengeCompletions,
    themes,
  };
}
