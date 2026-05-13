import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ManholesService {
  constructor(private prisma: PrismaService) {}

  list(pref?: string) {
    return this.prisma.manhole.findMany({
      where: pref ? { prefEnName: pref } : undefined,
      orderBy: { manholeNo: 'asc' },
    });
  }

  async one(manholeNo: string) {
    const m = await this.prisma.manhole.findUnique({ where: { manholeNo } });
    if (!m) throw new NotFoundException();
    return m;
  }
}
