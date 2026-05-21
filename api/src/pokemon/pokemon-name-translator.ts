import { Injectable } from '@nestjs/common';
import { Locale } from '../common/locale';
import { PokemonDb } from './pokemon.db';

/**
 * Localises canonical (EN) Pokémon names to the requested locale.
 *
 * Callers fetch a bound localiser once per request and apply it to each
 * name. For EN the localiser is the identity function; for JA it looks up
 * the Pokemon catalogue. Falling back to the input string is the
 * translator's job, so call sites are just `localise(entry.name)`.
 *
 * Cached for a short window so concurrent / back-to-back requests on the
 * same warm container don't re-query the table per hit.
 */
const CACHE_TTL_MS = 5 * 60_000;

export type PokemonNameLocaliser = (name: string) => string;

const IDENTITY: PokemonNameLocaliser = (name) => name;

@Injectable()
export class PokemonNameTranslator {
  private enToJaCache: { value: Map<string, string>; expires: number } | null = null;
  private jaToEnCache: { value: Map<string, string>; expires: number } | null = null;

  constructor(private db: PokemonDb) {}

  /**
   * Returns a function that localises one EN name into the target locale.
   * Use it as a per-request boundary — fetch once, apply many times.
   */
  async forLocale(locale: Locale): Promise<PokemonNameLocaliser> {
    if (locale === 'en') {
      return IDENTITY;
    }

    const map = await this.enToJa();

    return (name) => map.get(name) ?? name;
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
   * decide whether to reverse-translate or accept the value as-is.
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
