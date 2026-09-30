import type { LocalDate, LocalTime } from '../types';

const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isLocalTime(value: string): value is LocalTime {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

/** Datum prema kalendaru telefona, bez UTC pomjeranja preko ponoći. */
export function localDateFor(date: Date): LocalDate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isLocalDate(value: string): value is LocalDate {
  const match = LOCAL_DATE_PATTERN.exec(value);
  if (!match) {
    return false;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function localDateToUtcMilliseconds(value: LocalDate): number {
  if (!isLocalDate(value)) {
    throw new Error(`Neispravan lokalni datum: ${value}`);
  }
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

/** Pozitivan rezultat znači da je to datum poslije from datuma. */
export function calendarDaysBetween(from: LocalDate, to: LocalDate): number {
  return Math.round(
    (localDateToUtcMilliseconds(to) - localDateToUtcMilliseconds(from)) /
      86_400_000,
  );
}
