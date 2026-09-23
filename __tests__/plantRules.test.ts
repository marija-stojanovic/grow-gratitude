import {
  cycleProgressMessage,
  decideWatering,
  growthStageFor,
  plantViewState,
  streakProgressMessage,
} from '../src/domain';
import { Plant } from '../src/types';

const plant = (changes: Partial<Plant> = {}): Plant => ({
  id: 'plant-1',
  themeId: 'daily-gratitude',
  plantTypeId: 'sunflower',
  name: 'Dnevni suncokret',
  cycleNumber: 2,
  isAutomatic: true,
  status: 'growing',
  currentStreak: 7,
  totalWaterings: 7,
  lastWateredOn: '2026-09-12',
  createdAt: '2026-09-06T08:00:00.000Z',
  completedAt: null,
  ...changes,
});

describe('growthStageFor', () => {
  test.each<[number, string]>([
    [0, 'seed'],
    [1, 'sprout'],
    [4, 'sprout'],
    [5, 'small'],
    [8, 'small'],
    [9, 'medium'],
    [12, 'medium'],
    [13, 'large'],
    [16, 'large'],
    [17, 'almost-grown'],
    [20, 'almost-grown'],
    [21, 'fully-grown'],
  ])('%i zalivanja prikazuje fazu %s', (days, stage) => {
    expect(growthStageFor(days)).toBe(stage);
  });
});

describe('decideWatering', () => {
  test('nastavlja niz narednog dana', () => {
    expect(decideWatering(plant(), '2026-09-13')).toMatchObject({
      outcome: 'watered',
      nextStreak: 8,
      restartedAfterMiss: false,
    });
  });

  test('odbija drugi unos istog dana', () => {
    expect(decideWatering(plant(), '2026-09-12')).toEqual({
      outcome: 'duplicate-day',
    });
  });

  test('nakon preskočenog dana počinje niz od jedan', () => {
    expect(decideWatering(plant(), '2026-09-14')).toMatchObject({
      outcome: 'watered',
      nextStreak: 1,
      restartedAfterMiss: true,
    });
  });

  test('završeni automatski suncokret pokreće naredni ciklus', () => {
    expect(
      decideWatering(plant({ currentStreak: 20 }), '2026-09-13'),
    ).toMatchObject({
      outcome: 'watered',
      nextStreak: 21,
      completedNow: true,
      startNextCycleAutomatically: true,
      offerNextCycle: false,
    });
  });

  test('za običnu biljku nudi naredni ciklus', () => {
    expect(
      decideWatering(
        plant({ currentStreak: 20, isAutomatic: false }),
        '2026-09-13',
      ),
    ).toMatchObject({
      completedNow: true,
      startNextCycleAutomatically: false,
      offerNextCycle: true,
    });
  });
});

test('preskočen dan prikazuje uvenulu biljku', () => {
  expect(plantViewState(plant(), '2026-09-14')).toMatchObject({
    status: 'withered',
    stage: 'withered',
    witheredFromStage: 'small',
    streak: 0,
  });
});

test.each([
  [1, 'sprout'],
  [5, 'small'],
  [9, 'medium'],
  [13, 'large'],
  [17, 'almost-grown'],
] as const)(
  'uvenula biljka nakon %i dana zadržava fazu %s',
  (streak, stage) => {
    expect(
      plantViewState(plant({ currentStreak: streak }), '2026-09-14'),
    ).toMatchObject({ stage: 'withered', witheredFromStage: stage, streak: 0 });
  },
);

test('završeni suncokret ostaje odrasla biljka i poslije propuštenog dana', () => {
  expect(
    plantViewState(
      plant({ status: 'completed', currentStreak: 21 }),
      '2026-10-01',
    ),
  ).toMatchObject({
    stage: 'fully-grown',
    witheredFromStage: null,
    streak: 21,
  });
});

test('formatira dogovorenu poruku napretka', () => {
  expect(cycleProgressMessage(plant())).toBe(
    'Čestitamo! Vaš 2. ciklus je u toku.',
  );
  expect(streakProgressMessage(7)).toBe('7/21 uzastopnih dana');
});
