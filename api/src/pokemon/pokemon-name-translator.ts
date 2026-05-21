import { Injectable } from '@nestjs/common';
import { Locale } from '../common/locale';
import { PokemonDb } from './pokemon.db';

/**
 * Translates Pokémon names between locales.
 *
 * Two-method public API:
 *   - {@link translate}: canonical EN → display name in the target locale
 *     (identity for EN, katakana for JA, falls back to input if unknown).
 *   - {@link toCanonical}: anything → canonical EN (used by write paths
 *     so the DB stays single-language).
 *
 * Catalogue maps are cached for a short window so back-to-back calls on the
 * same warm container don't re-query the Pokemon table.
 */
const CACHE_TTL_MS = 5 * 60_000;

@Injectable()
export class PokemonNameTranslator {
  private enToJaCache: { value: Map<string, string>; expires: number } | null = null;
  private jaToEnCache: { value: Map<string, string>; expires: number } | null = null;

  constructor(private db: PokemonDb) {}

  /**
   * Display name in the given locale.
   *
   * Bulk usage: `await Promise.all(names.map(n => translator.translate(n, locale)))`.
   * After the first hit the catalogue is cached, so subsequent calls within
   * the same request resolve from memory.
   */
  async translate(name: string, locale: Locale): Promise<string> {
    if (locale === 'en') {
      return name;
    }

    const map = await this.enToJa();

    return map.get(name) ?? name;
  }

  /**
   * Canonical (EN) form of any input. Accepts both EN and JA names; unknown
   * strings pass through unchanged so the DB can still hold them (typo,
   * post-enrichment additions).
   */
  async toCanonical(name: string): Promise<string> {
    const enToJa = await this.enToJa();

    if (enToJa.has(name)) {
      return name;
    }

    const jaToEn = await this.jaToEn();

    return jaToEn.get(name) ?? name;
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

  private async jaToEn(): Promise<Map<string, string>> {
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
