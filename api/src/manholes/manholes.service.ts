import { Injectable, NotFoundException } from '@nestjs/common';
import { Manhole as PrismaManhole } from '@prisma/client';
import { Manhole, ManholeSummary, PokemonRef } from '@dexkepo/shared';
import { Locale } from '../common/locale';
import { PokemonService } from '../pokemon/pokemon.service';
import { ManholesDb, ManholeListRow } from './manholes.db';

type PokemonJson = { name: string; zukan_url: string };

@Injectable()
export class ManholesService {
  constructor(
    private db: ManholesDb,
    private pokemonSvc: PokemonService,
  ) {}

  async list(locale: Locale = 'en', pref?: string): Promise<ManholeSummary[]> {
    const rows = await this.db.findAll(pref);

    return Promise.all(rows.map((row) => this.toSummary(row, locale)));
  }

  async one(locale: Locale, manholeNo: string): Promise<Manhole> {
    const row = await this.db.findOne(manholeNo);

    if (!row) {
      throw new NotFoundException();
    }

    return this.toDetail(row, locale);
  }

  /**
   * Internal: returns the canonical row (English) for joins that don't go
   * through the public API. Used by FavoritesService / TrainersService
   * pipelines that don't need localisation.
   */
  async listRaw(): Promise<ManholeListRow[]> {
    return this.db.findAll();
  }

  private async toSummary(row: ManholeListRow, locale: Locale): Promise<ManholeSummary> {
    const pokemon = (row.pokemon as unknown as PokemonJson[]) ?? [];
    const rarities = await Promise.all(
      pokemon.map((entry) => this.pokemonSvc.getRarity(entry.name)),
    );

    return {
      manholeNo: row.manholeNo,
      name: pickName(row, locale),
      prefEnName: row.prefEnName,
      lat: row.lat,
      lng: row.lng,
      pictureUrl: row.pictureUrl,
      pokemonNames: await Promise.all(
        pokemon.map((entry) => this.pokemonSvc.translate(entry.name, locale)),
      ),
      hasLegendary: rarities.some((rarity) => rarity.isLegendary),
      hasMythical: rarities.some((rarity) => rarity.isMythical),
    };
  }

  private async toDetail(row: PrismaManhole, locale: Locale): Promise<Manhole> {
    const pokemon = (row.pokemon as unknown as PokemonJson[]) ?? [];

    return {
      manholeNo: row.manholeNo,
      name: pickName(row, locale),
      prefName: pickPref(row, locale),
      prefEnName: row.prefEnName,
      city: row.city,
      address: row.address,
      lat: row.lat,
      lng: row.lng,
      pictureUrl: row.pictureUrl,
      pokemon: await Promise.all(
        pokemon.map(async (entry): Promise<PokemonRef> => {
          const [name, rarity] = await Promise.all([
            this.pokemonSvc.translate(entry.name, locale),
            this.pokemonSvc.getRarity(entry.name),
          ]);

          return {
            name,
            zukan_url: entry.zukan_url,
            isLegendary: rarity.isLegendary,
            isMythical: rarity.isMythical,
          };
        }),
      ),
    };
  }
}

function pickName(
  row: { name: string; nameJa: string | null },
  locale: Locale,
): string {
  if (locale === 'ja' && row.nameJa) {
    return row.nameJa;
  }

  return row.name;
}

function pickPref(
  row: { prefName: string; prefNameJa: string | null },
  locale: Locale,
): string {
  if (locale === 'ja' && row.prefNameJa) {
    return row.prefNameJa;
  }

  return row.prefName;
}
