import { Injectable } from '@nestjs/common';
import { AchievementCategory, AchievementDefinition, AchievementStatus } from '@dexkepo/shared';
import { Locale } from '../common/locale';
import { DexService } from '../dex/dex.service';
import { ManholesService } from '../manholes/manholes.service';
import { AchievementsDb } from './achievements.db';
import { PokemonDb } from '../pokemon/pokemon.db';
import { EvaluationContext, EvaluationOutcome, EvaluatorMap } from './evaluator';
import { countDefinitions, countEvaluators } from './types/count';
import { geoDefinitions, geoEvaluators } from './types/geo';
import { timeDefinitions, timeEvaluators } from './types/time';
import { typeDefinitions, typeEvaluators } from './types/type';
import { localiseAchievement } from './i18n';

const ALL_DEFINITIONS: AchievementDefinition[] = [
  ...countDefinitions,
  ...geoDefinitions,
  ...timeDefinitions,
  ...typeDefinitions,
];

const ALL_EVALUATORS: EvaluatorMap = {
  ...countEvaluators,
  ...geoEvaluators,
  ...timeEvaluators,
  ...typeEvaluators,
};

@Injectable()
export class AchievementsService {
  constructor(
    private db: AchievementsDb,
    private pokemonDb: PokemonDb,
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
  async listForUser(userId: string, locale: Locale = 'en'): Promise<AchievementStatus[]> {
    const [visits, allManholes, allPokemon, storedRows] = await Promise.all([
      this.dexSvc.listRaw(userId),
      this.manholesSvc.list(),
      this.pokemonDb.findAll(),
      this.db.findUnlockedForUser(userId),
    ]);

    const ctx: EvaluationContext = {
      visits,
      allManholes,
      pokemonByName: new Map(allPokemon.map((entry) => [entry.name, entry])),
    };

    const storedUnlockedAt = new Map(
      storedRows.map((row) => [row.achievementId, row.unlockedAt]),
    );

    const computed = ALL_DEFINITIONS.map((def) => {
      const evaluator = ALL_EVALUATORS[def.id];
      const outcome: EvaluationOutcome = evaluator ? evaluator(ctx) : { unlocked: false };

      return { def, outcome };
    });

    // Persist any newly-unlocked rows. Idempotent upsert handles re-runs.
    const newlyUnlocked = computed.filter(
      ({ def, outcome }) => outcome.unlocked && !storedUnlockedAt.has(def.id),
    );

    if (newlyUnlocked.length > 0) {
      await Promise.all(
        newlyUnlocked.map(({ def, outcome }) => {
          const unlockedAt = outcome.unlockedAt
            ? new Date(outcome.unlockedAt)
            : undefined;

          return this.db.upsertUnlocked(userId, def.id, unlockedAt);
        }),
      );
    }

    const now = new Date().toISOString();

    return computed.map(({ def, outcome }) => {
      const localised = localiseAchievement(def.id, def, locale);
      const merged: AchievementDefinition = {
        ...def,
        title: localised.title,
        description: localised.description,
      };
      const storedAt = storedUnlockedAt.get(def.id);

      if (storedAt) {
        return {
          ...merged,
          ...outcome,
          unlocked: true,
          unlockedAt: storedAt.toISOString(),
        };
      }

      if (outcome.unlocked) {
        return {
          ...merged,
          ...outcome,
          unlockedAt: outcome.unlockedAt ?? now,
        };
      }

      return { ...merged, ...outcome };
    });
  }

  /**
   * Public-safe slice of `listForUser`: unlocked badges only, no progress
   * numerators, no email/userid. Used by the anonymous trainer endpoint.
   */
  async publicListForUser(userId: string, locale: Locale = 'en'): Promise<
    Array<{
      id: string;
      title: string;
      description: string;
      category: AchievementCategory;
      unlockedAt: string;
    }>
  > {
    const all = await this.listForUser(userId, locale);

    return all
      .filter((entry) => entry.unlocked && entry.unlockedAt != null)
      .map((entry) => ({
        id: entry.id,
        title: entry.title,
        description: entry.description,
        category: entry.category,
        unlockedAt: entry.unlockedAt as string,
      }));
  }
}
