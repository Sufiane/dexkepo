import { Injectable } from '@nestjs/common';
import { Pokemon } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Read-only data access for the Pokemon metadata catalogue. Populated once
 * out-of-band by prisma/enrich-pokemon.ts. The achievement service joins it
 * with manhole visits to evaluate type-based badges.
 */
@Injectable()
export class PokemonDb {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<Pokemon[]> {
    return this.prisma.pokemon.findMany();
  }
}
