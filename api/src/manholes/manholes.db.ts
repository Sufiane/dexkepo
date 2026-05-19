import { Injectable } from '@nestjs/common';
import { Manhole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type ManholeSummary = Pick<
  Manhole,
  'manholeNo' | 'name' | 'prefEnName' | 'lat' | 'lng' | 'pictureUrl'
>;

/**
 * Data access for the Manhole aggregate. The only file in this module that
 * imports Prisma. Business logic lives in manholes.service.ts.
 */
@Injectable()
export class ManholesDb {
  constructor(private prisma: PrismaService) {}

  findAll(pref?: string): Promise<ManholeSummary[]> {
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

  findOne(manholeNo: string): Promise<Manhole | null> {
    return this.prisma.manhole.findUnique({ where: { manholeNo } });
  }
}
