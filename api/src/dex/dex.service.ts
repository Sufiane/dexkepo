import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DexService {
  constructor(private prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.dexEntry.findMany({
      where: { userId },
      include: { manhole: true },
      orderBy: { visitedAt: 'desc' },
    });
  }

  async mark(userId: string, manholeNo: string) {
    const m = await this.prisma.manhole.findUnique({ where: { manholeNo } });
    if (!m) throw new NotFoundException('Manhole not found');
    return this.prisma.dexEntry.upsert({
      where: { userId_manholeNo: { userId, manholeNo } },
      update: {},
      create: { userId, manholeNo },
    });
  }

  async unmark(userId: string, manholeNo: string) {
    await this.prisma.dexEntry
      .delete({ where: { userId_manholeNo: { userId, manholeNo } } })
      .catch(() => undefined);
  }
}
