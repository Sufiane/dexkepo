import { Injectable } from '@nestjs/common';
import { FavoritePokemon, FavoritesResponse } from '@dexkepo/shared';
import { Locale } from '../common/locale';
import { DexService } from '../dex/dex.service';
import { ManholesService } from '../manholes/manholes.service';
import { UsersService } from '../users/users.service';
import { PokemonNameTranslator } from '../pokemon/pokemon-name-translator';

/** How many favorites to expose in the leaderboard. */
const TOP_N = 3;

type PokemonRef = { name: string };

@Injectable()
export class FavoritesService {
  constructor(
    private dexSvc: DexService,
    private manholesSvc: ManholesService,
    private usersSvc: UsersService,
    private translator: PokemonNameTranslator,
  ) {}

  async listForUser(userId: string, locale: Locale = 'en'): Promise<FavoritesResponse> {
    const [visits, allManholes, user] = await Promise.all([
      this.dexSvc.listRaw(userId),
      this.manholesSvc.list(),
      this.usersSvc.me(userId),
    ]);

    const chosenFavorite = user.chosenFavorite;

    if (visits.length === 0) {
      return this.localise({ favorites: [], completedAll: false, chosenFavorite }, locale);
    }

    if (visits.length === allManholes.length) {
      const favorites = buildCompletedFavorites(chosenFavorite, allManholes);

      return this.localise({ favorites, completedAll: true, chosenFavorite }, locale);
    }

    const totalByName = new Map<string, number>();

    for (const manhole of allManholes) {
      for (const name of manhole.pokemonNames) {
        totalByName.set(name, (totalByName.get(name) ?? 0) + 1);
      }
    }

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
      .sort((a, b) => {
        if (b.visitedCount !== a.visitedCount) {
          return b.visitedCount - a.visitedCount;
        }

        return b.ratio - a.ratio;
      })
      .slice(0, TOP_N);

    return this.localise({ favorites, completedAll: false, chosenFavorite }, locale);
  }

  private async localise(
    response: FavoritesResponse,
    locale: Locale,
  ): Promise<FavoritesResponse> {
    if (locale === 'en') {
      return response;
    }

    const jaByName = await this.translator.enToJa();

    return {
      ...response,
      favorites: response.favorites.map((entry) => ({
        ...entry,
        name: jaByName.get(entry.name) ?? entry.name,
      })),
      chosenFavorite: response.chosenFavorite
        ? jaByName.get(response.chosenFavorite) ?? response.chosenFavorite
        : null,
    };
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
