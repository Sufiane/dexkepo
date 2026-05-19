import { Injectable, NotFoundException } from '@nestjs/common';
import { ManholesDb } from './manholes.db';

@Injectable()
export class ManholesService {
  constructor(private db: ManholesDb) {}

  list(pref?: string) {
    return this.db.findAll(pref);
  }

  async one(manholeNo: string) {
    const m = await this.db.findOne(manholeNo);

    if (!m) {
      throw new NotFoundException();
    }

    return m;
  }
}
