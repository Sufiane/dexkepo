import { AchievementDefinition, AchievementStatus, ManholeSummary } from '@dexkepo/shared';
import { Pokemon } from '@prisma/client';
import { DexEntryWithManhole } from '../dex/dex.db';

/**
 * Outcome of evaluating a single achievement — everything that wraps around
 * the static definition (unlocked flag, progress, optional unlock timestamp).
 */
export type EvaluationOutcome = Omit<AchievementStatus, keyof AchievementDefinition>;

/**
 * Inputs every evaluator may need. Categories that don't use a field just
 * ignore it — keeping a single shape means new categories can add inputs
 * without churning every existing evaluator's call site.
 */
export type EvaluationContext = {
  visits: DexEntryWithManhole[];
  allManholes: ManholeSummary[];
  /** Name → metadata for every Pokemon we've enriched from PokeAPI. */
  pokemonByName: Map<string, Pokemon>;
};

/**
 * Pure function that decides whether an achievement is unlocked for a given
 * user.
 */
export type Evaluator = (ctx: EvaluationContext) => EvaluationOutcome;

/** Map from achievement id to its evaluator. Each category file exports one. */
export type EvaluatorMap = Record<string, Evaluator>;
