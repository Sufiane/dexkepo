import { AchievementDefinition } from '@dexkepo/shared';
import { DexEntryWithManhole } from '../../dex/dex.db';
import { EvaluationOutcome, EvaluatorMap } from '../evaluator';
import { isNextDay, jstDateKey, jstHour } from '../jst';

// ---- Config -------------------------------------------------------------

const HOUR_MS = 60 * 60 * 1000;

/** Visits needed within the rolling window to unlock "On a roll". */
const ROLL_VISITS_REQUIRED = 3;
/** Width of the rolling window for "On a roll", in milliseconds. */
const ROLL_WINDOW_MS = 24 * HOUR_MS;
/** Consecutive JST days needed to unlock "Week of visits". */
const STREAK_DAYS_REQUIRED = 7;
/** "Early bird" unlocks when a visit lands strictly before this JST hour. */
const EARLY_BIRD_HOUR = 8;
/** "Night owl" unlocks when a visit lands at or after this JST hour. */
const NIGHT_OWL_HOUR = 22;

// ---- Definitions ---------------------------------------------------------

export const timeDefinitions: AchievementDefinition[] = [
  {
    id: 'on-a-roll',
    title: 'On a roll',
    description: `Mark ${ROLL_VISITS_REQUIRED} visits within any ${ROLL_WINDOW_MS / HOUR_MS}-hour window.`,
    icon: '🔥',
    category: 'time',
  },
  {
    id: 'week-of-visits',
    title: 'Week of visits',
    description: `Visit at least one cover on ${STREAK_DAYS_REQUIRED} consecutive days (JST).`,
    icon: '📅',
    category: 'time',
  },
  {
    id: 'early-bird',
    title: 'Early bird',
    description: `Mark a visit before ${EARLY_BIRD_HOUR} a.m. JST.`,
    icon: '🌅',
    category: 'time',
  },
  {
    id: 'night-owl',
    title: 'Night owl',
    description: `Mark a visit after ${NIGHT_OWL_HOUR - 12} p.m. JST.`,
    icon: '🌃',
    category: 'time',
  },
];

// ---- Evaluators ----------------------------------------------------------

function onARoll(visits: DexEntryWithManhole[]): EvaluationOutcome {
  if (visits.length < ROLL_VISITS_REQUIRED) {
    return {
      unlocked: false,
      progress: { current: visits.length, target: ROLL_VISITS_REQUIRED },
    };
  }

  const timestamps = visits
    .map((entry) => new Date(entry.visitedAt).getTime())
    .sort((a, b) => a - b);
  let left = 0;
  let unlocked = false;

  for (let right = 0; right < timestamps.length; right += 1) {
    while (timestamps[right] - timestamps[left] > ROLL_WINDOW_MS) {
      left += 1;
    }

    if (right - left + 1 >= ROLL_VISITS_REQUIRED) {
      unlocked = true;
      break;
    }
  }

  return {
    unlocked,
    progress: {
      current: unlocked ? ROLL_VISITS_REQUIRED : Math.min(visits.length, ROLL_VISITS_REQUIRED),
      target: ROLL_VISITS_REQUIRED,
    },
  };
}

function weekOfVisits(visits: DexEntryWithManhole[]): EvaluationOutcome {
  const days = new Set<string>();
  for (const entry of visits) {
    days.add(jstDateKey(new Date(entry.visitedAt)));
  }

  const sortedDays = [...days].sort();
  let bestStreak = 0;
  let currentStreak = 0;
  let previousKey: string | null = null;

  for (const key of sortedDays) {
    if (previousKey && isNextDay(previousKey, key)) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }

    previousKey = key;
  }

  return {
    unlocked: bestStreak >= STREAK_DAYS_REQUIRED,
    progress: {
      current: Math.min(bestStreak, STREAK_DAYS_REQUIRED),
      target: STREAK_DAYS_REQUIRED,
    },
  };
}

function firstVisitMatching(
  visits: DexEntryWithManhole[],
  hourPredicate: (hour: number) => boolean,
): EvaluationOutcome {
  for (const entry of visits) {
    const hour = jstHour(new Date(entry.visitedAt));

    if (hourPredicate(hour)) {
      return {
        unlocked: true,
        unlockedAt: new Date(entry.visitedAt).toISOString(),
      };
    }
  }

  return { unlocked: false };
}

export const timeEvaluators: EvaluatorMap = {
  'on-a-roll': (ctx) => onARoll(ctx.visits),
  'week-of-visits': (ctx) => weekOfVisits(ctx.visits),
  'early-bird': (ctx) => firstVisitMatching(ctx.visits, (hour) => hour < EARLY_BIRD_HOUR),
  'night-owl': (ctx) => firstVisitMatching(ctx.visits, (hour) => hour >= NIGHT_OWL_HOUR),
};
