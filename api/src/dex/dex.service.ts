import { Injectable, NotFoundException } from '@nestjs/common';
import { DexEntry } from '@prisma/client';
import { Manhole, PokemonRef } from '@dexkepo/shared';
import { Locale } from '../common/locale';
import {
  PokemonNameLocaliser,
  PokemonNameTranslator,
} from '../pokemon/pokemon-name-translator';
import { DexDb, DexEntryWithManhole } from './dex.db';
import { LocalisedDexEntry } from './dex.types';

type PokemonJson = { name: string; zukan_url: string };

@Injectable()
export class DexService {
  constructor(
    private db: DexDb,
    private translator: PokemonNameTranslator,
  ) {}

  /**
   * Localised list for the public API. Internal callers use {@link listRaw}.
   */
  async list(userId: string, locale: Locale = 'en'): Promise<LocalisedDexEntry[]> {
    const [rows, localisePokemon] = await Promise.all([
      this.db.findEntriesForUser(userId),
      this.translator.forLocale(locale),
    ]);

    return rows.map((row) => ({
      userId: row.userId,
      manholeNo: row.manholeNo,
      visitedAt: row.visitedAt,
      manhole: toLocalisedManhole(row.manhole, locale, localisePokemon),
    }));
  }

  /** Raw rows with English names — used by evaluators / favorites pipelines. */
  listRaw(userId: string): Promise<DexEntryWithManhole[]> {
    return this.db.findEntriesForUser(userId);
  }

  async mark(userId: string, manholeNo: string): Promise<DexEntry> {
    const manhole = await this.db.findManhole(manholeNo);

    if (!manhole) {
      throw new NotFoundException('Manhole not found');
    }

    return this.db.upsertEntry(userId, manholeNo);
  }

  unmark(userId: string, manholeNo: string): Promise<void> {
    return this.db.deleteEntry(userId, manholeNo);
  }
}

function toLocalisedManhole(
  row: DexEntryWithManhole['manhole'],
  locale: Locale,
  localisePokemon: PokemonNameLocaliser,
): Manhole {
  const pokemon = (row.pokemon as unknown as PokemonJson[]) ?? [];

  return {
    manholeNo: row.manholeNo,
    name: locale === 'ja' && row.nameJa ? row.nameJa : row.name,
    prefName: locale === 'ja' && row.prefNameJa ? row.prefNameJa : row.prefName,
    prefEnName: row.prefEnName,
    city: row.city,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    pictureUrl: row.pictureUrl,
    pokemon: pokemon.map(
      (entry): PokemonRef => ({
        name: localisePokemon(entry.name),
        zukan_url: entry.zukan_url,
      }),
    ),
  };
}
