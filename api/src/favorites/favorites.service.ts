import { Injectable } from '@nestjs/common';
import { FavoritePokemon, FavoritesResponse } from '@dexkepo/shared';
import { DexService } from '../dex/dex.service';
import { ManholesService } from '../manholes/manholes.service';

/** How many favorites to expose in the leaderboard. */
const TOP_N = 3;

type PokemonRef = { name: string };

@Injectable()
export class FavoritesService {
  constructor(
    private dexSvc: DexService,
    private manholesSvc: ManholesService,
  ) {}

  async listForUser(userId: string): Promise<FavoritesResponse> {
    const [visits, allManholes] = await Promise.all([
      this.dexSvc.list(userId),
      this.manholesSvc.list(),
    ]);

    if (visits.length === 0) {
      return { favorites: [], completedAll: false };
    }

    // Completed-everything sentinel: every Pokémon's ratio would tie at 1.0,
    // so picking a "favorite" is meaningless. UI treats this as a brag, not a
    // leaderboard.
    if (visits.length === allManholes.length) {
      return { favorites: [], completedAll: true };
    }

    // Denominator: how many covers feature each Pokémon, across the whole catalogue.
    const totalByName = new Map<string, number>();

    for (const manhole of allManholes) {
      for (const name of manhole.pokemonNames) {
        totalByName.set(name, (totalByName.get(name) ?? 0) + 1);
      }
    }

    // Numerator: how many of those covers the user has visited.
    const visitedByName = new Map<string, number>();

    for (const visit of visits) {
      const pokemonOnCover = visit.manhole.pokemon as unknown as PokemonRef[] | null;

      for (const pokemon of pokemonOnCover ?? []) {
        visitedByName.set(pokemon.name, (visitedByName.get(pokemon.name) ?? 0) + 1);
      }
    }

    const favorites: FavoritePokemon[] = [...visitedByName.entries()]
      .map(([name, visitedCount]): FavoritePokemon => {
        const totalCount = totalByName.get(name) ?? visitedCount;

        return {
          name,
          visitedCount,
          totalCount,
          ratio: visitedCount / totalCount,
        };
      })
      // Highest ratio first; absolute count as tiebreaker so a single-cover
      // 100% never beats a multi-cover 100% — the latter took more effort.
      .sort((a, b) => {
        if (b.ratio !== a.ratio) {
          return b.ratio - a.ratio;
        }

        return b.visitedCount - a.visitedCount;
      })
      .slice(0, TOP_N);

    return { favorites, completedAll: false };
  }
}
