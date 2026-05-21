import { Injectable } from '@nestjs/common';
import { Locale } from '../common/locale';
import { PokemonDb } from './pokemon.db';

/**
 * Builds name-translation maps from the Pokemon catalogue.
 *
 * Three services (manholes, dex, favorites) all needed the same EN→display
 * lookup to localise pokemon names in their responses; this is the single
 * source of truth.
 *
 * Cached for a short window so back-to-back requests on the same warm
 * container don't re-query the table on every hit.
 */
const CACHE_TTL_MS = 5 * 60_000;
const EMPTY: ReadonlyMap<string, string> = new Map();

@Injectable()
export class PokemonNameTranslator {
  private enToJaCache: { value: Map<string, string>; expires: number } | null = null;
  private jaToEnCache: { value: Map<string, string>; expires: number } | null = null;

  constructor(private db: PokemonDb) {}

  /**
   * Map of canonical EN name → display name for the given locale.
   *
   *   - 'en': empty (caller's `?? name` fallback yields the canonical EN).
   *   - 'ja': EN → JA katakana, populated from the Pokemon table.
   *
   * Pattern at the call site:
   *
   *     const names = await translator.namesFor(locale);
   *     // ...
   *     name: names.get(entry.name) ?? entry.name,
   */
  async namesFor(locale: Locale): Promise<ReadonlyMap<string, string>> {
    if (locale === 'en') {
      return EMPTY;
    }

    return this.enToJa();
  }

  /** JA → EN canonical. Used by UsersService to normalise on write. */
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

  /**
   * Whether a given string is a known canonical (EN) name. Lets write paths
   * decide if they should reverse-translate or accept the value as-is.
   */
  async isCanonical(name: string): Promise<boolean> {
    const map = await this.enToJa();

    return map.has(name);
  }

  private async enToJa(): Promise<Map<string, string>> {
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
}
