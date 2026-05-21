import { Module } from '@nestjs/common';
import { PokemonDb } from './pokemon.db';

/**
 * Catalogue of all featured Pokemon with their localised names + types.
 * Read-only; populated out-of-band by `prisma/enrich-pokemon.ts` and
 * `prisma/enrich-pokemon-ja.ts`.
 */
@Module({
  providers: [PokemonDb],
  exports: [PokemonDb],
})
export class PokemonModule {}
