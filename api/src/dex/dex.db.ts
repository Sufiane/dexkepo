import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Data access for the user-dex aggregate. The only file in this module that
 * imports Prisma. Business logic lives in dex.service.ts.
 */
@Injectable()
export class DexDb {
  constructor(private prisma: PrismaService) {}

  findManhole(manholeNo: string) {
    return this.prisma.manhole.findUnique({ where: { manholeNo } });
  }

  findEntriesForUser(userId: string) {
    return this.prisma.dexEntry.findMany({
      where: { userId },
      include: { manhole: true },
      orderBy: { visitedAt: 'desc' },
    });
  }

  upsertEntry(userId: string, manholeNo: string) {
    return this.prisma.dexEntry.upsert({
      where: { userId_manholeNo: { userId, manholeNo } },
      update: {},
      create: { userId, manholeNo },
    });
  }

  async deleteEntry(userId: string, manholeNo: string) {
    // Idempotent: swallow "record not found" so DELETE on a non-visited
    // manhole is a no-op rather than a 500.
    await this.prisma.dexEntry
      .delete({ where: { userId_manholeNo: { userId, manholeNo } } })
      .catch(() => undefined);
  }
}
