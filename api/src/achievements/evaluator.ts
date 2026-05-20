import { AchievementDefinition, AchievementStatus, ManholeSummary } from '@dexkepo/shared';
import { DexEntryWithManhole } from '../dex/dex.db';

/**
 * Outcome of evaluating a single achievement — everything that wraps around
 * the static definition (unlocked flag, progress, optional unlock timestamp).
 */
export type EvaluationOutcome = Omit<AchievementStatus, keyof AchievementDefinition>;

/**
 * Pure function that decides whether an achievement is unlocked for a given
 * user. Receives the user's visits and the full manhole list (some
 * achievements need totals).
 */
export type Evaluator = (
  visits: DexEntryWithManhole[],
  allManholes: ManholeSummary[],
) => EvaluationOutcome;

/** Map from achievement id to its evaluator. Each category file exports one. */
export type EvaluatorMap = Record<string, Evaluator>;
