import { Injectable, NotFoundException } from '@nestjs/common';
import { DexDb } from './dex.db';

@Injectable()
export class DexService {
  constructor(private db: DexDb) {}

  list(userId: string) {
    return this.db.findEntriesForUser(userId);
  }

  async mark(userId: string, manholeNo: string) {
    const m = await this.db.findManhole(manholeNo);

    if (!m) {
      throw new NotFoundException('Manhole not found');
    }

    return this.db.upsertEntry(userId, manholeNo);
  }

  unmark(userId: string, manholeNo: string) {
    return this.db.deleteEntry(userId, manholeNo);
  }
}
