import { MoodValue } from '../types';

export function shouldOfferSpinWheel(mood: MoodValue): boolean {
  return mood === 1 || mood === 2;
}
