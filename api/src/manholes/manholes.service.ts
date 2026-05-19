import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ManholesService {
  constructor(private prisma: PrismaService) {}

  list(pref?: string) {
    return this.prisma.manhole.findMany({
      where: pref ? { prefEnName: pref } : undefined,
      orderBy: { manholeNo: 'asc' },
      select: {
        manholeNo: true,
        name: true,
        prefEnName: true,
        lat: true,
        lng: true,
        pictureUrl: true,
      },
    });
  }

  async one(manholeNo: string) {
    const m = await this.prisma.manhole.findUnique({ where: { manholeNo } });
    if (!m) throw new NotFoundException();
    return m;
  }
}
