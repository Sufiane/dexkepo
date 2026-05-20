import { Injectable } from '@nestjs/common';
import { AchievementDefinition, AchievementStatus } from '@dexkepo/shared';
import { DexService } from '../dex/dex.service';
import { ManholesService } from '../manholes/manholes.service';
import { AchievementsDb } from './achievements.db';
import { EvaluationOutcome, EvaluatorMap } from './evaluator';
import { countDefinitions, countEvaluators } from './types/count';
import { geoDefinitions, geoEvaluators } from './types/geo';
import { timeDefinitions, timeEvaluators } from './types/time';

const ALL_DEFINITIONS: AchievementDefinition[] = [
  ...countDefinitions,
  ...geoDefinitions,
  ...timeDefinitions,
];

const ALL_EVALUATORS: EvaluatorMap = {
  ...countEvaluators,
  ...geoEvaluators,
  ...timeEvaluators,
};

@Injectable()
export class AchievementsService {
  constructor(
    private db: AchievementsDb,
    private dexSvc: DexService,
    private manholesSvc: ManholesService,
  ) {}

  /**
   * Returns every achievement for the user, with sticky semantics:
   *   - if there's a stored unlock row, the badge stays unlocked forever
   *     regardless of current visit state;
   *   - newly-eligible unlocks are persisted lazily on this call;
   *   - in-progress badges still expose a live `progress` numerator.
   */
  async listForUser(userId: string): Promise<AchievementStatus[]> {
    const [visits, allManholes, storedRows] = await Promise.all([
      this.dexSvc.list(userId),
      this.manholesSvc.list(),
      this.db.findUnlockedForUser(userId),
    ]);

    const storedUnlockedAt = new Map(
      storedRows.map((row) => [row.achievementId, row.unlockedAt]),
    );

    // Compute outcomes from current state in one pass.
    const computed = ALL_DEFINITIONS.map((def) => {
      const evaluator = ALL_EVALUATORS[def.id];
      const outcome: EvaluationOutcome = evaluator
        ? evaluator(visits, allManholes)
        : { unlocked: false };

      return { def, outcome };
    });

    // Persist any newly-unlocked rows. Idempotent upsert handles re-runs.
    const newlyUnlocked = computed.filter(
      ({ def, outcome }) => outcome.unlocked && !storedUnlockedAt.has(def.id),
    );

    if (newlyUnlocked.length > 0) {
      await Promise.all(
        newlyUnlocked.map(({ def, outcome }) => {
          // Prefer the evaluator's earned-at timestamp (e.g. the visit that
          // pushed the count over the threshold); fall back to the DB default.
          const unlockedAt = outcome.unlockedAt
            ? new Date(outcome.unlockedAt)
            : undefined;

          return this.db.upsertUnlocked(userId, def.id, unlockedAt);
        }),
      );
    }

    // Merge: stored unlock dates take precedence; otherwise use the freshly-
    // computed outcome (which may have its own unlockedAt for time-of-day
    // achievements that derive it from the underlying visit timestamp).
    const now = new Date().toISOString();

    return computed.map(({ def, outcome }) => {
      const storedAt = storedUnlockedAt.get(def.id);

      if (storedAt) {
        return {
          ...def,
          ...outcome,
          unlocked: true,
          unlockedAt: storedAt.toISOString(),
        };
      }

      if (outcome.unlocked) {
        return {
          ...def,
          ...outcome,
          unlockedAt: outcome.unlockedAt ?? now,
        };
      }

      return { ...def, ...outcome };
    });
  }
}
