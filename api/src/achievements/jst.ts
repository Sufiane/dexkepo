/**
 * Time helpers that pretend every visit happens in Japan, because every cover
 * is in Japan. Keeps streak / time-of-day achievements independent of the
 * user's browser timezone.
 */

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** YYYY-MM-DD string for the given date, expressed in JST. */
export function jstDateKey(date: Date): string {
  const shifted = new Date(date.getTime() + JST_OFFSET_MS);

  return shifted.toISOString().slice(0, 10);
}

/** Hour-of-day (0-23) for the given date, expressed in JST. */
export function jstHour(date: Date): number {
  const shifted = new Date(date.getTime() + JST_OFFSET_MS);

  return shifted.getUTCHours();
}

/** True if `nextKey` is the calendar day after `previousKey` (both YYYY-MM-DD). */
export function isNextDay(previousKey: string, nextKey: string): boolean {
  const previous = new Date(`${previousKey}T00:00:00Z`).getTime();
  const next = new Date(`${nextKey}T00:00:00Z`).getTime();

  return next - previous === DAY_MS;
}
