import { Injectable } from '@nestjs/common';
import { FavoritePokemon, FavoritesResponse } from '@dexkepo/shared';
import { DexService } from '../dex/dex.service';
import { ManholesService } from '../manholes/manholes.service';
import { UsersService } from '../users/users.service';

/** How many favorites to expose in the leaderboard. */
const TOP_N = 3;

type PokemonRef = { name: string };

@Injectable()
export class FavoritesService {
  constructor(
    private dexSvc: DexService,
    private manholesSvc: ManholesService,
    private usersSvc: UsersService,
  ) {}

  async listForUser(userId: string): Promise<FavoritesResponse> {
    const [visits, allManholes, user] = await Promise.all([
      this.dexSvc.list(userId),
      this.manholesSvc.list(),
      this.usersSvc.me(userId),
    ]);

    const chosenFavorite = user.chosenFavorite;

    if (visits.length === 0) {
      return { favorites: [], completedAll: false, chosenFavorite };
    }

    // Completed-everything sentinel: every Pokémon's ratio would tie at 1.0,
    // so the manual pick (if any) becomes the favorite. Otherwise UI shows
    // the "loves them all" message + a picker.
    if (visits.length === allManholes.length) {
      const favorites = buildCompletedFavorites(chosenFavorite, allManholes);

      return { favorites, completedAll: true, chosenFavorite };
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
      // Most-captured Pokémon win. Ratio is just the tiebreaker so that
      // when counts are equal, the user who completed the species fully
      // ranks above one who hasn't.
      .sort((a, b) => {
        if (b.visitedCount !== a.visitedCount) {
          return b.visitedCount - a.visitedCount;
        }

        return b.ratio - a.ratio;
      })
      .slice(0, TOP_N);

    return { favorites, completedAll: false, chosenFavorite };
  }
}

function buildCompletedFavorites(
  chosenFavorite: string | null,
  allManholes: { pokemonNames: string[] }[],
): FavoritePokemon[] {
  if (!chosenFavorite) {
    return [];
  }

  let totalCount = 0;

  for (const manhole of allManholes) {
    if (manhole.pokemonNames.includes(chosenFavorite)) {
      totalCount += 1;
    }
  }

  // Defensive: a chosen name no longer in the catalogue still renders.
  if (totalCount === 0) {
    totalCount = 1;
  }

  return [
    {
      name: chosenFavorite,
      visitedCount: totalCount,
      totalCount,
      ratio: 1,
    },
  ];
}
