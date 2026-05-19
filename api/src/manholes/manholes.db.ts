import { Injectable } from '@nestjs/common';
import { Manhole, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Raw Prisma select shape for the list endpoint. The service transforms this
 * into the public ManholeSummary contract.
 */
export type ManholeListRow = Pick<
  Manhole,
  'manholeNo' | 'name' | 'prefEnName' | 'lat' | 'lng' | 'pictureUrl' | 'pokemon'
>;

/**
 * Data access for the Manhole aggregate. The only file in this module that
 * imports Prisma. Business logic lives in manholes.service.ts.
 */
@Injectable()
export class ManholesDb {
  constructor(private prisma: PrismaService) {}

  findAll(pref?: string): Promise<ManholeListRow[]> {
    return this.prisma.manhole.findMany({
      where: pref ? { prefEnName: pref } : undefined,
      orderBy: { manholeNo: Prisma.SortOrder.asc },
      select: {
        manholeNo: true,
        name: true,
        prefEnName: true,
        lat: true,
        lng: true,
        pictureUrl: true,
        pokemon: true,
      },
    });
  }

  findOne(manholeNo: string): Promise<Manhole | null> {
    return this.prisma.manhole.findUnique({ where: { manholeNo } });
  }
}
