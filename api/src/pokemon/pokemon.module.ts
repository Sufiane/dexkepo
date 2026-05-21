import { Module } from '@nestjs/common';
import { PokemonDb } from './pokemon.db';
import { PokemonService } from './pokemon.service';

/**
 * Catalogue of all featured Pokemon with their localised names + types.
 * Read-only; populated out-of-band by `prisma/enrich-pokemon.ts` and
 * `prisma/enrich-pokemon-ja.ts`.
 */
@Module({
  providers: [PokemonDb, PokemonService],
  exports: [PokemonDb, PokemonService],
})
export class PokemonModule {}
