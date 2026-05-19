import { Injectable, NotFoundException } from '@nestjs/common';
import { DexEntry } from '@prisma/client';
import { DexDb, DexEntryWithManhole } from './dex.db';

@Injectable()
export class DexService {
  constructor(private db: DexDb) {}

  list(userId: string): Promise<DexEntryWithManhole[]> {
    return this.db.findEntriesForUser(userId);
  }

  async mark(userId: string, manholeNo: string): Promise<DexEntry> {
    const m = await this.db.findManhole(manholeNo);

    if (!m) {
      throw new NotFoundException('Manhole not found');
    }

    return this.db.upsertEntry(userId, manholeNo);
  }

  unmark(userId: string, manholeNo: string): Promise<void> {
    return this.db.deleteEntry(userId, manholeNo);
  }
}
