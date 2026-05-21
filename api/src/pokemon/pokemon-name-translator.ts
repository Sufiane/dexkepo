import { Injectable } from '@nestjs/common';
import { Locale } from '../common/locale';
import { PokemonDb } from './pokemon.db';

/**
 * Builds a name-translation map from the Pokemon catalogue.
 *
 * Three services (manholes, dex, favorites) all needed the same EN→JA
 * lookup to localise pokemon names in their responses; this is the single
 * source of truth. Result is cached for a short window so callers within a
 * request — and back-to-back requests on the same warm container — don't
 * re-query the table on every hit.
 */
const CACHE_TTL_MS = 5 * 60_000;

@Injectable()
export class PokemonNameTranslator {
  private cache: { value: Map<string, string>; expires: number } | null = null;

  constructor(private db: PokemonDb) {}

  /**
   * Returns a Map<en, ja>. Empty map for the EN locale (callers can skip the
   * lookup with `if (locale === 'en') return name;`).
   */
  async enToJa(locale: Locale): Promise<Map<string, string>> {
    if (locale === 'en') {
      return new Map();
    }

    const now = Date.now();

    if (this.cache && this.cache.expires > now) {
      return this.cache.value;
    }

    const rows = await this.db.findAll();
    const map = new Map<string, string>();

    for (const entry of rows) {
      if (entry.nameJa) {
        map.set(entry.name, entry.nameJa);
      }
    }

    this.cache = { value: map, expires: now + CACHE_TTL_MS };

    return map;
  }

  /**
   * Inverse — JA name back to EN canonical. Used by UsersService to
   * normalise `chosenFavorite` on write so the DB always stores EN.
   */
  async jaToEn(): Promise<Map<string, string>> {
    const enToJa = await this.enToJa('ja');
    const inverse = new Map<string, string>();

    for (const [en, ja] of enToJa) {
      inverse.set(ja, en);
    }

    return inverse;
  }
}
