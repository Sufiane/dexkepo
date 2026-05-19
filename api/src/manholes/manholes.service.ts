import { Injectable, NotFoundException } from '@nestjs/common';
import { Manhole } from '@prisma/client';
import { ManholeSummary } from '@dexkepo/shared';
import { ManholesDb, ManholeListRow } from './manholes.db';

type PokemonJson = { name: string; zukan_url: string };

@Injectable()
export class ManholesService {
  constructor(private db: ManholesDb) {}

  async list(pref?: string): Promise<ManholeSummary[]> {
    const rows = await this.db.findAll(pref);

    return rows.map((row) => this.toSummary(row));
  }

  async one(manholeNo: string): Promise<Manhole> {
    const manhole = await this.db.findOne(manholeNo);

    if (!manhole) {
      throw new NotFoundException();
    }

    return manhole;
  }

  private toSummary(row: ManholeListRow): ManholeSummary {
    const pokemon = (row.pokemon as unknown as PokemonJson[]) ?? [];

    return {
      manholeNo: row.manholeNo,
      name: row.name,
      prefEnName: row.prefEnName,
      lat: row.lat,
      lng: row.lng,
      pictureUrl: row.pictureUrl,
      pokemonNames: pokemon.map((entry) => entry.name),
    };
  }
}
