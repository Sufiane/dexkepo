import { Injectable } from '@nestjs/common';
import { Pokemon } from '@prisma/client';
import { Locale } from '../common/locale';
import { PokemonDb } from './pokemon.db';

/**
 * Pokémon catalogue queries — translation + metadata.
 *
 * Public surface:
 *   - {@link translate}   — canonical EN → display name in target locale
 *   - {@link toCanonical} — anything → canonical EN (write-side normalisation)
 *   - {@link getRarity}   — { isLegendary, isMythical } for a name
 *
 * Internally caches the catalogue for a short window so concurrent /
 * back-to-back calls on the same warm container don't re-query the table.
 */
const CACHE_TTL_MS = 5 * 60_000;

export type PokemonRarity = {
  isLegendary: boolean;
  isMythical: boolean;
};

const NOT_RARE: PokemonRarity = { isLegendary: false, isMythical: false };

@Injectable()
export class PokemonService {
  private byNameCache: { value: Map<string, Pokemon>; expires: number } | null = null;
  private jaToEnCache: { value: Map<string, string>; expires: number } | null = null;

  constructor(private db: PokemonDb) {}

  async translate(name: string, locale: Locale): Promise<string> {
    if (locale === 'en') {
      return name;
    }

    const byName = await this.byName();

    return byName.get(name)?.nameJa ?? name;
  }

  async toCanonical(name: string): Promise<string> {
    const byName = await this.byName();

    if (byName.has(name)) {
      return name;
    }

    const jaToEn = await this.jaToEn();

    return jaToEn.get(name) ?? name;
  }

  async getRarity(name: string): Promise<PokemonRarity> {
    const byName = await this.byName();
    const row = byName.get(name);

    if (!row) {
      return NOT_RARE;
    }

    return { isLegendary: row.isLegendary, isMythical: row.isMythical };
  }

  private async byName(): Promise<Map<string, Pokemon>> {
    const now = Date.now();

    if (this.byNameCache && this.byNameCache.expires > now) {
      return this.byNameCache.value;
    }

    const rows = await this.db.findAll();
    const map = new Map<string, Pokemon>();

    for (const entry of rows) {
      map.set(entry.name, entry);
    }

    this.byNameCache = { value: map, expires: now + CACHE_TTL_MS };

    return map;
  }

  private async jaToEn(): Promise<Map<string, string>> {
    const now = Date.now();

    if (this.jaToEnCache && this.jaToEnCache.expires > now) {
      return this.jaToEnCache.value;
    }

    const byName = await this.byName();
    const inverse = new Map<string, string>();

    for (const entry of byName.values()) {
      if (entry.nameJa) {
        inverse.set(entry.nameJa, entry.name);
      }
    }

    this.jaToEnCache = { value: inverse, expires: now + CACHE_TTL_MS };

    return inverse;
  }
}
