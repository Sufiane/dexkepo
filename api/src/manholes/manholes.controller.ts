import { Controller, Get, Param, Query } from '@nestjs/common';
import { ManholesService } from './manholes.service';

@Controller('manholes')
export class ManholesController {
  constructor(private svc: ManholesService) {}

  @Get()
  list(@Query('pref') pref?: string) {
    return this.svc.list(pref);
  }

  @Get(':manholeNo')
  one(@Param('manholeNo') manholeNo: string) {
    return this.svc.one(manholeNo);
  }
}
