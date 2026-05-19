import { Injectable } from '@nestjs/common';
import { DexEntry, Manhole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type DexEntryWithManhole = DexEntry & { manhole: Manhole };

/**
 * Data access for the user-dex aggregate. The only file in this module that
 * imports Prisma. Business logic lives in dex.service.ts.
 */
@Injectable()
export class DexDb {
  constructor(private prisma: PrismaService) {}

  findManhole(manholeNo: string): Promise<Manhole | null> {
    return this.prisma.manhole.findUnique({ where: { manholeNo } });
  }

  findEntriesForUser(userId: string): Promise<DexEntryWithManhole[]> {
    return this.prisma.dexEntry.findMany({
      where: { userId },
      include: { manhole: true },
      orderBy: { visitedAt: 'desc' },
    });
  }

  upsertEntry(userId: string, manholeNo: string): Promise<DexEntry> {
    return this.prisma.dexEntry.upsert({
      where: { userId_manholeNo: { userId, manholeNo } },
      update: {},
      create: { userId, manholeNo },
    });
  }

  async deleteEntry(userId: string, manholeNo: string): Promise<void> {
    // Idempotent: swallow "record not found" so DELETE on a non-visited
    // manhole is a no-op rather than a 500.
    await this.prisma.dexEntry
      .delete({ where: { userId_manholeNo: { userId, manholeNo } } })
      .catch(() => undefined);
  }
}
