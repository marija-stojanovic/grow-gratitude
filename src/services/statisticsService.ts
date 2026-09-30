import { isLocalDate, localDateFor } from '../domain/dateRules';
import { challengeRepository } from '../repositories/challengeRepository';
import { gratitudeRepository } from '../repositories/gratitudeRepository';
import { moodRepository } from '../repositories/moodRepository';
import { plantRepository } from '../repositories/plantRepository';
import type {
  ChallengeCompletion,
  GratitudeEntry,
  LocalDate,
  MoodEntry,
  MoodValue,
  Plant,
} from '../types';

export type StatisticsPeriod = 'week' | 'month';

export interface MoodDay {
  date: LocalDate;
  dayOfMonth: number;
  weekday: string;
  value: MoodValue | null;
  isFuture: boolean;
}

export interface MoodPeriodSummary {
  average: number | null;
  recordedDays: number;
}

export interface StatisticsData {
  lastSevenDays: MoodDay[];
  currentMonth: MoodDay[];
  weekSummary: MoodPeriodSummary;
  monthSummary: MoodPeriodSummary;
  totalGratitudes: number;
  completedPlants: number;
  completedChallenges: number;
  longestGratitudeStreak: number;
}

function parseLocalDate(value: LocalDate): Date {
  if (!isLocalDate(value)) {
    throw new Error(`Neispravan datum za statistiku: ${value}`);
  }
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function addDays(value: LocalDate, amount: number): LocalDate {
  const date = parseLocalDate(value);
  date.setDate(date.getDate() + amount);
  return localDateFor(date);
}

function moodDay(
  date: LocalDate,
  moodsByDate: Map<LocalDate, MoodValue>,
  today: LocalDate,
): MoodDay {
  const parsed = parseLocalDate(date);
  return {
    date,
    dayOfMonth: parsed.getDate(),
    weekday: new Intl.DateTimeFormat('sr-Latn-RS', {
      weekday: 'short',
    }).format(parsed),
    value: moodsByDate.get(date) ?? null,
    isFuture: date > today,
  };
}

function summarize(days: MoodDay[]): MoodPeriodSummary {
  const values = days.flatMap(day => (day.value === null ? [] : [day.value]));
  return {
    average:
      values.length === 0
        ? null
        : values.reduce((sum, value) => sum + value, 0) / values.length,
    recordedDays: values.length,
  };
}

export function calculateStatistics(
  moods: MoodEntry[],
  gratitudes: GratitudeEntry[],
  plants: Plant[],
  challengeCompletions: ChallengeCompletion[],
  today: LocalDate,
): StatisticsData {
  const moodsByDate = new Map(
    moods.map(entry => [entry.entryDate, entry.value] as const),
  );
  const lastSevenDays = Array.from({ length: 7 }, (_, index) =>
    moodDay(addDays(today, index - 6), moodsByDate, today),
  );

  const todayDate = parseLocalDate(today);
  const year = todayDate.getFullYear();
  const month = todayDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const currentMonth = Array.from({ length: daysInMonth }, (_, index) =>
    moodDay(
      localDateFor(new Date(year, month, index + 1, 12)),
      moodsByDate,
      today,
    ),
  );
  const uniqueChallengeCompletions = new Set(
    challengeCompletions.map(
      completion => `${completion.challengeId}:${completion.completionDate}`,
    ),
  );

  return {
    lastSevenDays,
    currentMonth,
    weekSummary: summarize(lastSevenDays),
    monthSummary: summarize(currentMonth.filter(day => !day.isFuture)),
    totalGratitudes: gratitudes.length,
    completedPlants: plants.filter(plant => plant.status === 'completed')
      .length,
    completedChallenges: uniqueChallengeCompletions.size,
    longestGratitudeStreak: gratitudes.reduce(
      (longest, entry) => Math.max(longest, entry.streakDay),
      0,
    ),
  };
}

export async function loadStatisticsData(
  today: LocalDate,
): Promise<StatisticsData> {
  const [moods, gratitudes, plants, challengeCompletions] = await Promise.all([
    moodRepository.findAll(),
    gratitudeRepository.findAll(),
    plantRepository.findAll(),
    challengeRepository.findAllCompletions(),
  ]);
  return calculateStatistics(
    moods,
    gratitudes,
    plants,
    challengeCompletions,
    today,
  );
}
