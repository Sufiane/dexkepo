import { Injectable, NotFoundException } from '@nestjs/common';
import { Manhole } from '@prisma/client';
import { ManholesDb, ManholeSummary } from './manholes.db';

@Injectable()
export class ManholesService {
  constructor(private db: ManholesDb) {}

  list(pref?: string): Promise<ManholeSummary[]> {
    return this.db.findAll(pref);
  }

  async one(manholeNo: string): Promise<Manhole> {
    const manhole = await this.db.findOne(manholeNo);

    if (!manhole) {
      throw new NotFoundException();
    }

    return manhole;
  }
}
