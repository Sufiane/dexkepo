import { AchievementDefinition, ManholeSummary } from '@dexkepo/shared';
import { DexEntryWithManhole } from '../../dex/dex.db';
import { EvaluationOutcome, EvaluatorMap } from '../evaluator';

// ---- Config -------------------------------------------------------------

/** How many distinct prefectures to visit before "Globetrotter" unlocks. */
const GLOBETROTTER_PREFECTURE_TARGET = 10;

// ---- Definitions ---------------------------------------------------------

export const geoDefinitions: AchievementDefinition[] = [
  {
    id: 'globetrotter',
    title: 'Globetrotter',
    description: `Visit covers in ${GLOBETROTTER_PREFECTURE_TARGET} different prefectures.`,
    icon: '🗾',
    category: 'geo',
  },
  {
    id: 'all-prefectures',
    title: 'Every prefecture',
    description: 'Visit at least one cover in every prefecture that has one.',
    icon: '🇯🇵',
    category: 'geo',
  },
  {
    id: 'local-hero',
    title: 'Local hero',
    description: 'Visit every cover in a single prefecture.',
    icon: '🏔️',
    category: 'geo',
  },
];

// ---- Evaluators ----------------------------------------------------------

function distinctPrefectures(
  visits: DexEntryWithManhole[],
  target: number,
): EvaluationOutcome {
  const visited = new Set(visits.map((entry) => entry.manhole.prefEnName));
  const current = visited.size;

  return {
    unlocked: current >= target,
    progress: { current: Math.min(current, target), target },
  };
}

function allPrefectures(
  visits: DexEntryWithManhole[],
  allManholes: ManholeSummary[],
): EvaluationOutcome {
  const allPrefectureSet = new Set(allManholes.map((manhole) => manhole.prefEnName));
  const visitedPrefectureSet = new Set(
    visits.map((entry) => entry.manhole.prefEnName),
  );
  const current = visitedPrefectureSet.size;
  const target = allPrefectureSet.size;

  return {
    unlocked: current >= target && target > 0,
    progress: { current, target },
  };
}

function localHero(
  visits: DexEntryWithManhole[],
  allManholes: ManholeSummary[],
): EvaluationOutcome {
  // Per-prefecture totals from the full manhole list.
  const totals = new Map<string, number>();
  for (const manhole of allManholes) {
    totals.set(manhole.prefEnName, (totals.get(manhole.prefEnName) ?? 0) + 1);
  }

  // Per-prefecture visit counts.
  const visited = new Map<string, number>();
  for (const entry of visits) {
    visited.set(
      entry.manhole.prefEnName,
      (visited.get(entry.manhole.prefEnName) ?? 0) + 1,
    );
  }

  let bestRatio = 0;
  let bestCurrent = 0;
  let bestTarget = 1;
  let unlocked = false;

  for (const [pref, total] of totals) {
    const count = visited.get(pref) ?? 0;
    const ratio = count / total;

    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestCurrent = count;
      bestTarget = total;
    }

    if (count === total && total > 0) {
      unlocked = true;
    }
  }

  return {
    unlocked,
    progress: { current: bestCurrent, target: bestTarget },
  };
}

export const geoEvaluators: EvaluatorMap = {
  globetrotter: (visits) => distinctPrefectures(visits, GLOBETROTTER_PREFECTURE_TARGET),
  'all-prefectures': (visits, allManholes) => allPrefectures(visits, allManholes),
  'local-hero': (visits, allManholes) => localHero(visits, allManholes),
};
