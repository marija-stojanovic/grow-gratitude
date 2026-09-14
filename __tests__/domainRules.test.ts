import {
  calendarDaysBetween,
  canDeactivateChallenge,
  createNextCyclePlant,
  hasActivePlantForTheme,
  isLocalDate,
  planPlantDeletion,
  shouldOfferSpinWheel,
  validateGratitude,
} from '../src/domain';
import { Challenge, Plant } from '../src/types';

const completedPlant: Plant = {
  id: 'sunflower-1', themeId: 'daily', plantTypeId: 'sunflower',
  name: 'Dnevni suncokret', cycleNumber: 1, isAutomatic: true,
  status: 'completed', currentStreak: 21, totalWaterings: 21,
  lastWateredOn: '2026-09-13', createdAt: '2026-08-24T08:00:00.000Z',
  completedAt: '2026-09-13T08:00:00.000Z',
};

test('računa kalendarske dane preko mjeseca i godine', () => {
  expect(calendarDaysBetween('2026-12-31', '2027-01-01')).toBe(1);
  expect(isLocalDate('2026-02-29')).toBe(false);
});

test('zahvalnost ne prihvata samo razmake', () => {
  expect(validateGratitude('  \n ')).toEqual({ valid: false, reason: 'required' });
  expect(validateGratitude('  Zahvalna sam na porodici.  ')).toEqual({
    valid: true, value: 'Zahvalna sam na porodici.',
  });
});

test('Spin Wheel se nudi samo za dva najniža raspoloženja', () => {
  expect(shouldOfferSpinWheel(1)).toBe(true);
  expect(shouldOfferSpinWheel(2)).toBe(true);
  expect(shouldOfferSpinWheel(3)).toBe(false);
});

test('ne dozvoljava isključivanje posljednjeg aktivnog izazova', () => {
  const challenge: Challenge = {
    id: 'one', title: 'Prošetaj 15 minuta', origin: 'built-in', isActive: true,
    createdAt: '2026-09-13T08:00:00.000Z', updatedAt: '2026-09-13T08:00:00.000Z',
  };
  expect(canDeactivateChallenge('one', [challenge])).toBe(false);
  expect(canDeactivateChallenge('one', [challenge, { ...challenge, id: 'two' }])).toBe(true);
});

test('automatski naredni ciklus počinje od nule', () => {
  const nextPlant = createNextCyclePlant(
    completedPlant, 'sunflower-2', '2026-09-13T08:00:01.000Z',
  );
  expect(nextPlant).toMatchObject({
    cycleNumber: 2, currentStreak: 0, status: 'growing', isAutomatic: true,
  });
  expect(hasActivePlantForTheme([completedPlant, nextPlant], 'daily')).toBe(true);
});

test('brisanje biljke zahtijeva potvrdu i briše njene zahvalnosti', () => {
  expect(planPlantDeletion('sunflower-1')).toEqual({
    plantId: 'sunflower-1',
    deleteRelatedGratitudes: true,
    requiresConfirmation: true,
  });
});
