import { Injectable, NotFoundException } from '@nestjs/common';
import { Manhole as PrismaManhole } from '@prisma/client';
import { Manhole, ManholeSummary, PokemonRef } from '@dexkepo/shared';
import { Locale } from '../common/locale';
import { PokemonDb } from '../pokemon/pokemon.db';
import { ManholesDb, ManholeListRow } from './manholes.db';

type PokemonJson = { name: string; zukan_url: string };

@Injectable()
export class ManholesService {
  constructor(
    private db: ManholesDb,
    private pokemonDb: PokemonDb,
  ) {}

  /**
   * Localised list. Falls back to English values when a JA translation
   * is missing on a given row (e.g. #448 PokéPark KANTO has no scraped JA).
   */
  async list(locale: Locale = 'en', pref?: string): Promise<ManholeSummary[]> {
    const [rows, pokemonNameJa] = await Promise.all([
      this.db.findAll(pref),
      this.pokemonNameMap(locale),
    ]);

    return rows.map((row) => this.toSummary(row, locale, pokemonNameJa));
  }

  async one(locale: Locale, manholeNo: string): Promise<Manhole> {
    const [row, pokemonNameJa] = await Promise.all([
      this.db.findOne(manholeNo),
      this.pokemonNameMap(locale),
    ]);

    if (!row) {
      throw new NotFoundException();
    }

    return this.toDetail(row, locale, pokemonNameJa);
  }

  /**
   * Internal: returns the canonical row (English) for joins that don't go
   * through the public API. Used by FavoritesService / TrainersService
   * pipelines that don't need localisation.
   */
  async listRaw(): Promise<ManholeListRow[]> {
    return this.db.findAll();
  }

  private async pokemonNameMap(locale: Locale): Promise<Map<string, string>> {
    if (locale === 'en') {
      return new Map();
    }

    const all = await this.pokemonDb.findAll();
    const map = new Map<string, string>();

    for (const entry of all) {
      if (entry.nameJa) {
        map.set(entry.name, entry.nameJa);
      }
    }

    return map;
  }

  private toSummary(
    row: ManholeListRow,
    locale: Locale,
    pokemonNameJa: Map<string, string>,
  ): ManholeSummary {
    const pokemon = (row.pokemon as unknown as PokemonJson[]) ?? [];

    return {
      manholeNo: row.manholeNo,
      name: pickName(row, locale),
      prefEnName: row.prefEnName,
      lat: row.lat,
      lng: row.lng,
      pictureUrl: row.pictureUrl,
      pokemonNames: pokemon.map((entry) => pickPokemonName(entry.name, pokemonNameJa)),
    };
  }

  private toDetail(
    row: PrismaManhole,
    locale: Locale,
    pokemonNameJa: Map<string, string>,
  ): Manhole {
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
      pokemon: pokemon.map(
        (entry): PokemonRef => ({
          name: pickPokemonName(entry.name, pokemonNameJa),
          zukan_url: entry.zukan_url,
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

function pickPokemonName(name: string, jaMap: Map<string, string>): string {
  return jaMap.get(name) ?? name;
}
