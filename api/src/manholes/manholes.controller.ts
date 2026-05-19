import { Controller, Get, Param, Query } from '@nestjs/common';
import { Manhole } from '@prisma/client';
import { ManholeSummary } from '@dexkepo/shared';
import { ManholesService } from './manholes.service';

@Controller('manholes')
export class ManholesController {
  constructor(private svc: ManholesService) {}

  @Get()
  list(@Query('pref') pref?: string): Promise<ManholeSummary[]> {
    return this.svc.list(pref);
  }

  @Get(':manholeNo')
  one(@Param('manholeNo') manholeNo: string): Promise<Manhole> {
    return this.svc.one(manholeNo);
  }
}
