import { AchievementDefinition } from '@dexkepo/shared';
import { DexEntryWithManhole } from '../../dex/dex.db';
import { EvaluationOutcome, EvaluatorMap } from '../evaluator';

// ---- Config -------------------------------------------------------------

/** Total number of manhole covers in the dataset. Used in target numbers. */
export const TOTAL_COVERS = 470;

/** Thresholds for each visit-count milestone. */
const FIRST_VISIT_THRESHOLD = 1;
const ROOKIE_THRESHOLD = 5;
const ROAD_WARRIOR_THRESHOLD = 25;
const HALFWAY_THRESHOLD = TOTAL_COVERS / 2;
const MASTER_THRESHOLD = TOTAL_COVERS;

// ---- Definitions ---------------------------------------------------------

export const countDefinitions: AchievementDefinition[] = [
  {
    id: 'first-steps',
    title: 'First steps',
    description: 'Mark your first cover as visited.',
    icon: '🏁',
    category: 'count',
  },
  {
    id: 'rookie-trainer',
    title: 'Rookie trainer',
    description: `Visit ${ROOKIE_THRESHOLD} covers.`,
    icon: '🌱',
    category: 'count',
  },
  {
    id: 'road-warrior',
    title: 'Road warrior',
    description: `Visit ${ROAD_WARRIOR_THRESHOLD} covers.`,
    icon: '🎒',
    category: 'count',
  },
  {
    id: 'halfway-there',
    title: 'Halfway there',
    description: `Visit half of all covers (${HALFWAY_THRESHOLD}).`,
    icon: '⚡',
    category: 'count',
  },
  {
    id: 'pokemon-master',
    title: 'Pokémon Master',
    description: `Visit all ${MASTER_THRESHOLD} covers.`,
    icon: '👑',
    category: 'count',
  },
];

// ---- Evaluators ----------------------------------------------------------

function visitCount(visits: DexEntryWithManhole[], target: number): EvaluationOutcome {
  const current = visits.length;
  const unlocked = current >= target;
  const sorted = [...visits].sort(
    (a, b) => new Date(a.visitedAt).getTime() - new Date(b.visitedAt).getTime(),
  );
  const unlockedAt = unlocked
    ? new Date(sorted[target - 1].visitedAt).toISOString()
    : undefined;

  return {
    unlocked,
    progress: { current: Math.min(current, target), target },
    unlockedAt,
  };
}

export const countEvaluators: EvaluatorMap = {
  'first-steps': (visits) => visitCount(visits, FIRST_VISIT_THRESHOLD),
  'rookie-trainer': (visits) => visitCount(visits, ROOKIE_THRESHOLD),
  'road-warrior': (visits) => visitCount(visits, ROAD_WARRIOR_THRESHOLD),
  'halfway-there': (visits) => visitCount(visits, HALFWAY_THRESHOLD),
  'pokemon-master': (visits) => visitCount(visits, MASTER_THRESHOLD),
};
