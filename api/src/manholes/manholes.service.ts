import { Injectable, NotFoundException } from '@nestjs/common';
import { Manhole as PrismaManhole } from '@prisma/client';
import { Manhole, ManholeSummary, PokemonRef } from '@dexkepo/shared';
import { Locale } from '../common/locale';
import { PokemonNameTranslator } from '../pokemon/pokemon-name-translator';
import { ManholesDb, ManholeListRow } from './manholes.db';

type PokemonJson = { name: string; zukan_url: string };

const EMPTY_MAP: Map<string, string> = new Map();

@Injectable()
export class ManholesService {
  constructor(
    private db: ManholesDb,
    private translator: PokemonNameTranslator,
  ) {}

  /**
   * Localised list. Falls back to English values when a JA translation
   * is missing on a given row (e.g. #448 PokéPark KANTO has no scraped JA).
   */
  async list(locale: Locale = 'en', pref?: string): Promise<ManholeSummary[]> {
    const [rows, pokemonNameJa] = await Promise.all([
      this.db.findAll(pref),
      locale === 'ja' ? this.translator.enToJa() : Promise.resolve(EMPTY_MAP),
    ]);

    return rows.map((row) => this.toSummary(row, locale, pokemonNameJa));
  }

  async one(locale: Locale, manholeNo: string): Promise<Manhole> {
    const [row, pokemonNameJa] = await Promise.all([
      this.db.findOne(manholeNo),
      locale === 'ja' ? this.translator.enToJa() : Promise.resolve(EMPTY_MAP),
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
      pokemonNames: pokemon.map((entry) => pokemonNameJa.get(entry.name) ?? entry.name),
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
          name: pokemonNameJa.get(entry.name) ?? entry.name,
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
