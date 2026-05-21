import { Injectable } from '@nestjs/common';
import { PokemonDb } from './pokemon.db';

/**
 * Builds name-translation maps from the Pokemon catalogue.
 *
 * Three services (manholes, dex, favorites) all needed the same EN→JA
 * lookup to localise pokemon names in their responses; this is the single
 * source of truth. Result is cached for a short window so back-to-back
 * requests on the same warm container don't re-query the table on every hit.
 *
 * Callers gate by locale themselves — keeps method names truthful (no
 * `enToJa('en')` shenanigans).
 */
const CACHE_TTL_MS = 5 * 60_000;

@Injectable()
export class PokemonNameTranslator {
  private enToJaCache: { value: Map<string, string>; expires: number } | null = null;
  private jaToEnCache: { value: Map<string, string>; expires: number } | null = null;

  constructor(private db: PokemonDb) {}

  /** Map<en, ja>. Skip the call if you don't need JA — don't ask for the map. */
  async enToJa(): Promise<Map<string, string>> {
    const now = Date.now();

    if (this.enToJaCache && this.enToJaCache.expires > now) {
      return this.enToJaCache.value;
    }

    const rows = await this.db.findAll();
    const map = new Map<string, string>();

    for (const entry of rows) {
      if (entry.nameJa) {
        map.set(entry.name, entry.nameJa);
      }
    }

    this.enToJaCache = { value: map, expires: now + CACHE_TTL_MS };

    return map;
  }

  /** Map<ja, en>. Used to normalise incoming JA names to canonical EN on write. */
  async jaToEn(): Promise<Map<string, string>> {
    const now = Date.now();

    if (this.jaToEnCache && this.jaToEnCache.expires > now) {
      return this.jaToEnCache.value;
    }

    const enToJa = await this.enToJa();
    const inverse = new Map<string, string>();

    for (const [en, ja] of enToJa) {
      inverse.set(ja, en);
    }

    this.jaToEnCache = { value: inverse, expires: now + CACHE_TTL_MS };

    return inverse;
  }
}
